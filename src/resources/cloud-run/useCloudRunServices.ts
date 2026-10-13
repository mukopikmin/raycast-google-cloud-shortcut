import { useCallback, useEffect, useRef } from "react";
import { useGoogleApi } from "../../auth/google";
import { usePaginatedResources } from "../../hooks/usePaginatedResources";
import { PageOptions, ResourcePage } from "../../pagination/types";
import { normalizeSearch } from "../../pagination/search";
import { RESOURCE_LIMIT } from "../../pagination/pages";
import { GoogleApiError } from "../../auth/GoogleApiError";
import {
  listCloudRunGlobalServicesPage,
  listCloudRunLocationsPage,
  listCloudRunRegionalServicesPage,
  listCloudRunServicesPage,
} from "./api";
import { CloudRunDeployment, CloudRunPageOptions, CloudRunRegionStream, CloudRunServicesCursor } from "./types";

export const CLOUD_RUN_SEARCH_CONCURRENCY = 6;
const getResourceId = (item: CloudRunDeployment) => item.id;
const getSearchText = (item: CloudRunDeployment) => item.keywords.join(" ");
const getName = (item: CloudRunDeployment) => item.name;

const checkToken = (previous: string | undefined, next: string | undefined) => {
  if (next && next === previous) throw new Error("Cloud Run returned a repeated pagination token.");
};

const regionStreams = (regions: string[], known: Set<string>): CloudRunRegionStream[] =>
  [...regions]
    .sort((a, b) => Number(known.has(b)) - Number(known.has(a)) || a.localeCompare(b))
    .map((region) => ({ region }));

export const useCloudRunServices = (projectId: string, searchText = "") => {
  const { accessToken } = useGoogleApi();
  const searching = Boolean(normalizeSearch(searchText));
  // Scope known-region priorities to the current project and credentials.
  const fetchRegion = useCallback(
    (region: string, options: CloudRunPageOptions) =>
      listCloudRunRegionalServicesPage(projectId, region, accessToken, options),
    [projectId, accessToken],
  );
  const cursor = useRef<CloudRunServicesCursor | undefined>(undefined);
  const knownRegions = useRef({ scope: fetchRegion, regions: new Set<string>() });
  useEffect(() => () => cursor.current?.controller.abort(), []);

  const fetchPage = useCallback(
    async (options: PageOptions): Promise<ResourcePage<CloudRunDeployment>> => {
      if (!options.pageToken) {
        cursor.current?.controller.abort();
        if (knownRegions.current.scope !== fetchRegion)
          knownRegions.current = { scope: fetchRegion, regions: new Set() };
        cursor.current = {
          phase: "global",
          regions: [],
          ready: [],
          inFlight: new Map(),
          seenRegions: new Set(),
          completedRegions: new Set(),
          continuation: 0,
          controller: new AbortController(),
        };
      }
      const scan = cursor.current;
      if (!scan || (options.pageToken && options.pageToken !== String(scan.continuation))) {
        throw new Error("Cloud Run pagination is no longer current. Reload the list.");
      }
      const checkCurrent = () => {
        if (cursor.current !== scan || scan.controller.signal.aborted) {
          const error = new Error("Cloud Run search was superseded");
          error.name = "AbortError";
          throw error;
        }
      };
      let resources: CloudRunDeployment[] = [];
      let unreachable: string[] = [];
      try {
        checkCurrent();
        if (scan.phase === "global") {
          const requestOptions = {
            pageToken: scan.globalNextPageToken,
            signal: scan.controller.signal,
          };
          const page = searching
            ? await listCloudRunGlobalServicesPage(projectId, accessToken, requestOptions)
            : await listCloudRunServicesPage(projectId, accessToken, { ...requestOptions, pageSize: options.pageSize });
          checkCurrent();
          checkToken(scan.globalNextPageToken, page.nextPageToken);
          resources = page.deployments;
          resources.forEach(({ region }) => {
            if (region) knownRegions.current.regions.add(region);
          });
          unreachable = page.unreachable;
          if (searching) {
            const missingRegions = unreachable.filter((region) => !scan.seenRegions.has(region));
            missingRegions.forEach((region) => scan.seenRegions.add(region));
            scan.regions.push(...missingRegions);
          }
          scan.globalNextPageToken = page.nextPageToken;
          if (!page.nextPageToken) {
            if (searching) {
              scan.ready = regionStreams(scan.regions, knownRegions.current.regions);
              scan.phase = scan.ready.length ? "regional" : "done";
            } else {
              scan.phase = "locations";
            }
          }
        } else if (scan.phase === "locations") {
          const page = await listCloudRunLocationsPage(projectId, accessToken, {
            pageSize: searching ? RESOURCE_LIMIT : options.pageSize,
            pageToken: scan.locationsNextPageToken,
            signal: scan.controller.signal,
          });
          checkCurrent();
          checkToken(scan.locationsNextPageToken, page.nextPageToken);
          scan.locationsNextPageToken = page.nextPageToken;
          const regions = page.regions.filter((region) => !scan.seenRegions.has(region));
          regions.forEach((region) => scan.seenRegions.add(region));
          scan.regions.push(...regions);
          if (!page.nextPageToken) {
            scan.ready = regionStreams(scan.regions, knownRegions.current.regions);
            scan.phase = scan.ready.length ? "regional" : "done";
          }
        } else if (scan.phase === "regional") {
          const concurrency = searching ? CLOUD_RUN_SEARCH_CONCURRENCY : 1;
          while (scan.ready.length && scan.inFlight.size < concurrency) {
            const stream = scan.ready.shift()!;
            const pending = fetchRegion(stream.region, {
              pageSize: searching ? RESOURCE_LIMIT : options.pageSize,
              pageToken: stream.nextPageToken,
              signal: scan.controller.signal,
            }).then(
              (page) => ({ stream, page }),
              (error: unknown) => ({ stream, error }),
            );
            scan.inFlight.set(stream.region, pending);
          }
          // Consume each completed page immediately so a slow region cannot
          // hold back useful results from the other in-flight regions.
          const outcome = await Promise.race(scan.inFlight.values());
          checkCurrent();
          scan.inFlight.delete(outcome.stream.region);
          if ("error" in outcome) {
            const error = outcome.error;
            if (
              !(error instanceof GoogleApiError) ||
              (error.status !== 403 && error.status !== 404 && error.status < 500)
            )
              throw error;
            unreachable = [outcome.stream.region];
          } else {
            const { stream, page } = outcome;
            checkToken(stream.nextPageToken, page.nextPageToken);
            resources = page.deployments;
            if (page.nextPageToken) {
              stream.nextPageToken = page.nextPageToken;
              scan.ready.unshift(stream);
            } else {
              scan.completedRegions.add(stream.region);
            }
          }
          if (!scan.ready.length && !scan.inFlight.size) scan.phase = "done";
        }
      } catch (error) {
        scan.controller.abort();
        throw error;
      }
      scan.continuation += 1;
      return {
        resources,
        unreachable,
        nextPageToken: scan.phase === "done" ? undefined : String(scan.continuation),
      };
    },
    [projectId, accessToken, fetchRegion, searching],
  );
  const result = usePaginatedResources(fetchPage, getResourceId, getSearchText, searchText, getName);
  return {
    ...result,
    services: result.resources,
    unreachable: (result.unreachable ?? []).filter((region) => !cursor.current?.completedRegions.has(region)),
  };
};

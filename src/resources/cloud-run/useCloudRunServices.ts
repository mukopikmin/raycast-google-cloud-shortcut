import { useCallback, useRef } from "react";
import { useGoogleApi } from "../../auth/google";
import { usePaginatedResources } from "../../hooks/usePaginatedResources";
import { PageOptions, ResourcePage } from "../../pagination/types";
import { normalizeSearch } from "../../pagination/search";
import { GoogleApiError } from "../../auth/GoogleApiError";
import { listCloudRunLocationsPage, listCloudRunRegionalServicesPage, listCloudRunServicesPage } from "./api";
import { CloudRunDeployment } from "./types";

const getResourceId = (item: CloudRunDeployment) => item.id;
const getSearchText = (item: CloudRunDeployment) => item.keywords.join(" ");

const getName = (item: CloudRunDeployment) => item.name;

type ServicesCursor = {
  phase: "global" | "locations" | "regional" | "done";
  globalNextPageToken?: string;
  locationsNextPageToken?: string;
  regionalNextPageToken?: string;
  regions: string[];
  regionIndex: number;
  seenRegions: Set<string>;
  completedRegions: Set<string>;
  continuation: number;
};

const nextRegion = (cursor: ServicesCursor) => {
  cursor.regionalNextPageToken = undefined;
  cursor.regionIndex += 1;
  if (cursor.regionIndex >= cursor.regions.length) {
    cursor.phase = cursor.locationsNextPageToken ? "locations" : "done";
  }
};

const checkToken = (previous: string | undefined, next: string | undefined) => {
  if (next && next === previous) throw new Error("Cloud Run returned a repeated pagination token.");
};

export const useCloudRunServices = (projectId: string, searchText = "") => {
  const { accessToken } = useGoogleApi();
  const searching = Boolean(normalizeSearch(searchText));
  const cursor = useRef<ServicesCursor | undefined>(undefined);
  const fetchPage = useCallback(
    async (options: PageOptions): Promise<ResourcePage<CloudRunDeployment>> => {
      if (!options.pageToken) {
        // The global v1 response can stop without a continuation token even
        // when a region has more services. Search must page through each region.
        cursor.current = {
          phase: searching ? "locations" : "global",
          regions: [],
          regionIndex: 0,
          seenRegions: new Set(),
          completedRegions: new Set(),
          continuation: 0,
        };
      }
      const scan = cursor.current;
      if (!scan || (options.pageToken && options.pageToken !== String(scan.continuation))) {
        throw new Error("Cloud Run pagination is no longer current. Reload the list.");
      }
      const checkCurrent = () => {
        if (cursor.current !== scan) {
          const error = new Error("Cloud Run search was superseded");
          error.name = "AbortError";
          throw error;
        }
      };
      let resources: CloudRunDeployment[] = [];
      let unreachable: string[] = [];
      if (scan.phase === "global") {
        const page = await listCloudRunServicesPage(projectId, accessToken, {
          pageSize: options.pageSize,
          pageToken: scan.globalNextPageToken,
        });
        checkCurrent();
        checkToken(scan.globalNextPageToken, page.nextPageToken);
        resources = page.deployments;
        unreachable = page.unreachable;
        scan.globalNextPageToken = page.nextPageToken;
        if (!page.nextPageToken) scan.phase = "locations";
      } else if (scan.phase === "locations") {
        const page = await listCloudRunLocationsPage(projectId, accessToken, {
          pageSize: options.pageSize,
          pageToken: scan.locationsNextPageToken,
        });
        checkCurrent();
        checkToken(scan.locationsNextPageToken, page.nextPageToken);
        scan.locationsNextPageToken = page.nextPageToken;
        scan.regions = page.regions.filter((region) => !scan.seenRegions.has(region));
        scan.regions.forEach((region) => scan.seenRegions.add(region));
        scan.regionIndex = 0;
        scan.phase = scan.regions.length ? "regional" : page.nextPageToken ? "locations" : "done";
      } else if (scan.phase === "regional") {
        const region = scan.regions[scan.regionIndex];
        try {
          const page = await listCloudRunRegionalServicesPage(projectId, region, accessToken, {
            pageSize: options.pageSize,
            pageToken: scan.regionalNextPageToken,
          });
          checkCurrent();
          checkToken(scan.regionalNextPageToken, page.nextPageToken);
          resources = page.deployments;
          scan.regionalNextPageToken = page.nextPageToken;
          if (!page.nextPageToken) {
            scan.completedRegions.add(region);
            nextRegion(scan);
          }
        } catch (error) {
          checkCurrent();
          if (
            !(error instanceof GoogleApiError) ||
            (error.status !== 403 && error.status !== 404 && error.status < 500)
          ) {
            throw error;
          }
          unreachable = [region];
          nextRegion(scan);
        }
      }
      scan.continuation += 1;
      return {
        resources,
        unreachable,
        nextPageToken: scan.phase === "done" ? undefined : String(scan.continuation),
      };
    },
    [projectId, accessToken, searching],
  );
  const result = usePaginatedResources(fetchPage, getResourceId, getSearchText, searchText, getName);
  return {
    ...result,
    services: result.resources,
    unreachable: (result.unreachable ?? []).filter((region) => !cursor.current?.completedRegions.has(region)),
  };
};

import { collectMatchingResourcePage, mergeResourceSearchPages, normalizeSearch } from "../../pagination/search";
import { PageOptions } from "../../pagination/types";
import { toReadableCron } from "./cron";
import { appendResourcePage } from "../../pagination/pages";
import { useCallback, useEffect, useState, useRef } from "react";
import { usePromise } from "@raycast/utils";
import { CloudSchedulerJob } from "./types";
import { listCloudSchedulerJobsPage } from "./api";
import { useGoogleApi } from "../../auth/google";

const CLOUD_SCHEDULER_JOB_PAGE_SIZE = 50;
const getName = (resource: CloudSchedulerJob) => resource.name;
const getResourceId = (resource: CloudSchedulerJob) => `${resource.region}/${resource.name}`;
const getSearchText = (resource: CloudSchedulerJob) =>
  [
    resource.name,
    resource.region,
    resource.description,
    resource.schedule,
    toReadableCron(resource.schedule),
    resource.timeZone,
  ].join(" ");

const searchSchedulerPage = (
  projectId: string,
  locationId: string,
  accessToken: string,
  options: PageOptions & { legacyAppEngineCron?: boolean },
  query: string,
  isCurrent: () => boolean,
  onPageChecked: () => void,
) =>
  collectMatchingResourcePage(
    async (pageOptions) => {
      const page = await listCloudSchedulerJobsPage(projectId, locationId, accessToken, { ...options, ...pageOptions });
      return { resources: page.jobs, nextPageToken: page.nextPageToken };
    },
    options,
    query,
    getResourceId,
    getSearchText,
    isCurrent,
    onPageChecked,
    getName,
  );

type SuccessResult = {
  scheduledJobs: CloudSchedulerJob[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  isTruncated: boolean;
  loadMore: () => Promise<void>;
  isSearching: boolean;
  pagesSearched: number;
  error: undefined;
  reload: () => Promise<void>;
};

type LoadingResult = {
  scheduledJobs: undefined;
  isLoading: true;
  isLoadingMore: false;
  hasMore: false;
  isTruncated: false;
  loadMore: () => Promise<void>;
  isSearching: boolean;
  pagesSearched: number;
  error: undefined;
};

type ErrorResult = {
  scheduledJobs: undefined;
  isLoading: false;
  isLoadingMore: false;
  hasMore: false;
  isTruncated: false;
  loadMore: () => Promise<void>;
  isSearching: boolean;
  pagesSearched: number;
  error: Error;
};

type UseCloudSchedulerJobsResult = SuccessResult | LoadingResult | ErrorResult;

type PaginationTokens = {
  defaultNextPageToken?: string;
  legacyNextPageToken?: string;
};

export const useCloudSchedulerJobs = (
  projectId: string,
  locationId: string,
  searchText = "",
): UseCloudSchedulerJobsResult => {
  const { accessToken } = useGoogleApi();
  const [scheduledJobs, setScheduledJobs] = useState<CloudSchedulerJob[]>([]);
  const [paginationTokens, setPaginationTokens] = useState<PaginationTokens>({});
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState<Error | undefined>();
  const loadingMore = useRef(false);
  const generation = useRef(0);
  const query = normalizeSearch(searchText);
  const activeQuery = useRef(query);
  const [pagesSearched, setPagesSearched] = useState(0);
  const activeProject = useRef({ projectId, locationId, accessToken });
  useEffect(
    () => () => {
      generation.current += 1;
    },
    [],
  );

  const loadMore = useCallback(async () => {
    if (
      (!paginationTokens.defaultNextPageToken && !paginationTokens.legacyNextPageToken) ||
      loadingMore.current ||
      activeQuery.current !== query ||
      activeProject.current.projectId !== projectId ||
      activeProject.current.locationId !== locationId ||
      activeProject.current.accessToken !== accessToken
    ) {
      return;
    }

    const requestGeneration = generation.current;
    loadingMore.current = true;
    setIsLoadingMore(true);
    setLoadMoreError(undefined);
    setPagesSearched(0);
    try {
      const isCurrent = () => requestGeneration === generation.current;
      const onPageChecked = () => {
        if (query) setPagesSearched((count) => count + 1);
      };
      const defaultPage = paginationTokens.defaultNextPageToken
        ? await searchSchedulerPage(
            projectId,
            locationId,
            accessToken,
            {
              pageSize: CLOUD_SCHEDULER_JOB_PAGE_SIZE,
              pageToken: paginationTokens.defaultNextPageToken,
            },
            query,
            isCurrent,
            onPageChecked,
          )
        : { resources: [] };

      let legacyPage: { resources: CloudSchedulerJob[]; nextPageToken?: string } = { resources: [] };
      if (paginationTokens.legacyNextPageToken) {
        try {
          legacyPage = await searchSchedulerPage(
            projectId,
            locationId,
            accessToken,
            {
              pageSize: CLOUD_SCHEDULER_JOB_PAGE_SIZE,
              pageToken: paginationTokens.legacyNextPageToken,
              legacyAppEngineCron: true,
            },
            query,
            isCurrent,
            onPageChecked,
          );
        } catch (error) {
          if (scheduledJobs.length === 0 && defaultPage.resources.length === 0 && !defaultPage.nextPageToken) {
            throw error;
          }
        }
      }

      if (requestGeneration !== generation.current) return;
      const next = appendResourcePage(
        { resources: scheduledJobs, isTruncated },
        { resources: [...defaultPage.resources, ...legacyPage.resources] },
        getResourceId,
      );
      setScheduledJobs(next.resources);
      setIsTruncated(next.isTruncated);
      setPaginationTokens({
        defaultNextPageToken: defaultPage.nextPageToken,
        legacyNextPageToken: legacyPage.nextPageToken,
      });
    } catch (error) {
      if (requestGeneration !== generation.current) return;
      setLoadMoreError(error instanceof Error ? error : new Error(String(error)));
    } finally {
      if (requestGeneration === generation.current) {
        loadingMore.current = false;
        setIsLoadingMore(false);
      }
    }
  }, [accessToken, isTruncated, locationId, paginationTokens, projectId, query, scheduledJobs]);

  const noopLoadMore = useCallback(async () => undefined, []);

  const { isLoading, error, revalidate } = usePromise(
    async (projId: string, locId: string, token: string, search: string) => {
      const requestGeneration = ++generation.current;
      activeQuery.current = search;
      activeProject.current = { projectId: projId, locationId: locId, accessToken: token };
      setPagesSearched(0);
      loadingMore.current = false;
      setIsLoadingMore(false);
      setScheduledJobs([]);
      setPaginationTokens({});
      setIsTruncated(false);
      setLoadMoreError(undefined);

      const isCurrent = () => requestGeneration === generation.current;
      const onPageChecked = () => {
        if (search) setPagesSearched((count) => count + 1);
      };
      const defaultPage = await searchSchedulerPage(
        projId,
        locId,
        token,
        {
          pageSize: CLOUD_SCHEDULER_JOB_PAGE_SIZE,
        },
        search,
        isCurrent,
        onPageChecked,
      );

      let legacyPage: { resources: CloudSchedulerJob[]; nextPageToken?: string } = { resources: [] };
      try {
        legacyPage = await searchSchedulerPage(
          projId,
          locId,
          token,
          {
            pageSize: CLOUD_SCHEDULER_JOB_PAGE_SIZE,
            legacyAppEngineCron: true,
          },
          search,
          isCurrent,
          onPageChecked,
        );
      } catch (error) {
        if (defaultPage.resources.length === 0 && !defaultPage.nextPageToken) {
          throw error;
        }
      }

      if (requestGeneration !== generation.current) return;
      const initial = search
        ? mergeResourceSearchPages([defaultPage, legacyPage], search, getResourceId, getSearchText, getName)
        : appendResourcePage(
            { resources: [], isTruncated: false },
            { resources: [...defaultPage.resources, ...legacyPage.resources] },
            getResourceId,
          );
      setScheduledJobs(initial.resources);
      setPaginationTokens({
        defaultNextPageToken: defaultPage.nextPageToken,
        legacyNextPageToken: legacyPage.nextPageToken,
      });
      setIsTruncated(initial.isTruncated);
      return initial.resources;
    },
    [projectId, locationId, accessToken, query],
  );

  const resultError = error || loadMoreError;

  if (resultError) {
    return {
      scheduledJobs: undefined,
      isLoading: false,
      isLoadingMore: false,
      hasMore: false,
      isTruncated: false,
      loadMore: noopLoadMore,
      isSearching: Boolean(query) && isLoading,
      pagesSearched,
      error: resultError,
    };
  }

  const loadedJobs = scheduledJobs;

  if (isLoading && loadedJobs.length === 0) {
    return {
      scheduledJobs: undefined,
      isLoading: true,
      isLoadingMore: false,
      hasMore: false,
      isTruncated: false,
      loadMore: noopLoadMore,
      isSearching: Boolean(query) && isLoading,
      pagesSearched,
      error: undefined,
    };
  }

  return {
    scheduledJobs: loadedJobs,
    isLoading,
    isLoadingMore,
    hasMore: Boolean(paginationTokens.defaultNextPageToken || paginationTokens.legacyNextPageToken),
    isTruncated,
    loadMore,
    isSearching: Boolean(query) && (isLoading || isLoadingMore),
    pagesSearched,
    reload: async () => {
      await revalidate();
    },
    error: undefined,
  };
};

import { appendResourcePage } from "../../pagination/pages";
import { useCallback, useState, useRef } from "react";
import { usePromise } from "@raycast/utils";
import { CloudSchedulerJob } from "./types";
import { listCloudSchedulerJobsPage } from "./api";
import { useGoogleApi } from "../../auth/google";

const CLOUD_SCHEDULER_JOB_PAGE_SIZE = 50;

type SuccessResult = {
  scheduledJobs: CloudSchedulerJob[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  isTruncated: boolean;
  loadMore: () => Promise<void>;
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
  error: undefined;
};

type ErrorResult = {
  scheduledJobs: undefined;
  isLoading: false;
  isLoadingMore: false;
  hasMore: false;
  isTruncated: false;
  loadMore: () => Promise<void>;
  error: Error;
};

type UseCloudSchedulerJobsResult = SuccessResult | LoadingResult | ErrorResult;

type PaginationTokens = {
  defaultNextPageToken?: string;
  legacyNextPageToken?: string;
};

export const useCloudSchedulerJobs = (projectId: string, locationId: string): UseCloudSchedulerJobsResult => {
  const { accessToken } = useGoogleApi();
  const [scheduledJobs, setScheduledJobs] = useState<CloudSchedulerJob[]>([]);
  const [paginationTokens, setPaginationTokens] = useState<PaginationTokens>({});
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState<Error | undefined>();
  const loadingMore = useRef(false);
  const generation = useRef(0);

  const loadMore = useCallback(async () => {
    if ((!paginationTokens.defaultNextPageToken && !paginationTokens.legacyNextPageToken) || loadingMore.current) {
      return;
    }

    const requestGeneration = generation.current;
    loadingMore.current = true;
    setIsLoadingMore(true);
    setLoadMoreError(undefined);
    try {
      const defaultPage = paginationTokens.defaultNextPageToken
        ? await listCloudSchedulerJobsPage(projectId, locationId, accessToken, {
            pageSize: CLOUD_SCHEDULER_JOB_PAGE_SIZE,
            pageToken: paginationTokens.defaultNextPageToken,
          })
        : { jobs: [] };

      let legacyPage: { jobs: CloudSchedulerJob[]; nextPageToken?: string } = { jobs: [] };
      if (paginationTokens.legacyNextPageToken) {
        try {
          legacyPage = await listCloudSchedulerJobsPage(projectId, locationId, accessToken, {
            pageSize: CLOUD_SCHEDULER_JOB_PAGE_SIZE,
            pageToken: paginationTokens.legacyNextPageToken,
            legacyAppEngineCron: true,
          });
        } catch (error) {
          if (scheduledJobs.length === 0 && defaultPage.jobs.length === 0 && !defaultPage.nextPageToken) {
            throw error;
          }
        }
      }

      if (requestGeneration !== generation.current) return;
      const next = appendResourcePage(
        { resources: scheduledJobs, isTruncated },
        { resources: [...defaultPage.jobs, ...legacyPage.jobs] },
        (resource) => `${resource.region}/${resource.name}`,
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
  }, [accessToken, isTruncated, locationId, paginationTokens, projectId, scheduledJobs]);

  const noopLoadMore = useCallback(async () => undefined, []);

  const { isLoading, error, revalidate } = usePromise(
    async (projId: string, locId: string, token: string) => {
      const requestGeneration = ++generation.current;
      loadingMore.current = false;
      setIsLoadingMore(false);
      setScheduledJobs([]);
      setPaginationTokens({});
      setIsTruncated(false);
      setLoadMoreError(undefined);

      const defaultPage = await listCloudSchedulerJobsPage(projId, locId, token, {
        pageSize: CLOUD_SCHEDULER_JOB_PAGE_SIZE,
      });

      let legacyPage: { jobs: CloudSchedulerJob[]; nextPageToken?: string } = { jobs: [] };
      try {
        legacyPage = await listCloudSchedulerJobsPage(projId, locId, token, {
          pageSize: CLOUD_SCHEDULER_JOB_PAGE_SIZE,
          legacyAppEngineCron: true,
        });
      } catch (error) {
        if (defaultPage.jobs.length === 0 && !defaultPage.nextPageToken) {
          throw error;
        }
      }

      if (requestGeneration !== generation.current) return;
      const initial = appendResourcePage(
        { resources: [], isTruncated: false },
        { resources: [...defaultPage.jobs, ...legacyPage.jobs] },
        (resource) => `${resource.region}/${resource.name}`,
      );
      setScheduledJobs(initial.resources);
      setPaginationTokens({
        defaultNextPageToken: defaultPage.nextPageToken,
        legacyNextPageToken: legacyPage.nextPageToken,
      });
      setIsTruncated(initial.isTruncated);
      return initial.resources;
    },
    [projectId, locationId, accessToken],
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
    reload: async () => {
      await revalidate();
    },
    error: undefined,
  };
};

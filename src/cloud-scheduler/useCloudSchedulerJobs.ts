import { useCallback, useState } from "react";
import { usePromise } from "@raycast/utils";
import { CloudSchedulerJob } from "./types";
import { CloudSchedulerJobsPage, listCloudSchedulerJobsPage } from "./api";
import { useGoogleApi } from "../auth/google";

const CLOUD_SCHEDULER_JOB_LIMIT = 500;
const CLOUD_SCHEDULER_JOB_PAGE_SIZE = CLOUD_SCHEDULER_JOB_LIMIT;

type SuccessResult = {
  scheduledJobs: CloudSchedulerJob[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  isTruncated: boolean;
  loadMore: () => Promise<void>;
  error: undefined;
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

const mergeJobs = (jobs: CloudSchedulerJob[], nextJobs: CloudSchedulerJob[]): CloudSchedulerJob[] => {
  const jobsByName = new Map<string, CloudSchedulerJob>();
  for (const job of [...jobs, ...nextJobs]) {
    jobsByName.set(job.name, job);
  }
  return Array.from(jobsByName.values());
};

const listFirstNonEmptyCloudSchedulerJobsPage = async (
  projectId: string,
  locationId: string,
  accessToken: string,
  options: { pageSize: number; pageToken?: string; legacyAppEngineCron?: boolean },
): Promise<CloudSchedulerJobsPage> => {
  let pageToken = options.pageToken;
  const seenPageTokens = new Set<string>();

  for (;;) {
    const page = await listCloudSchedulerJobsPage(projectId, locationId, accessToken, {
      ...options,
      pageToken,
    });

    if (page.jobs.length > 0 || !page.nextPageToken || seenPageTokens.has(page.nextPageToken)) {
      return page;
    }

    seenPageTokens.add(page.nextPageToken);
    pageToken = page.nextPageToken;
  }
};

export const useCloudSchedulerJobs = (projectId: string, locationId: string): UseCloudSchedulerJobsResult => {
  const { accessToken } = useGoogleApi();
  const [scheduledJobs, setScheduledJobs] = useState<CloudSchedulerJob[]>([]);
  const [paginationTokens, setPaginationTokens] = useState<PaginationTokens>({});
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState<Error | undefined>();

  const loadMore = useCallback(async () => {
    if (
      (!paginationTokens.defaultNextPageToken && !paginationTokens.legacyNextPageToken) ||
      isLoadingMore ||
      isTruncated
    ) {
      return;
    }

    setIsLoadingMore(true);
    setLoadMoreError(undefined);
    try {
      const defaultPage = paginationTokens.defaultNextPageToken
        ? await listFirstNonEmptyCloudSchedulerJobsPage(projectId, locationId, accessToken, {
            pageSize: CLOUD_SCHEDULER_JOB_PAGE_SIZE,
            pageToken: paginationTokens.defaultNextPageToken,
          })
        : { jobs: [] };

      let legacyPage: { jobs: CloudSchedulerJob[]; nextPageToken?: string } = { jobs: [] };
      if (paginationTokens.legacyNextPageToken) {
        try {
          legacyPage = await listFirstNonEmptyCloudSchedulerJobsPage(projectId, locationId, accessToken, {
            pageSize: CLOUD_SCHEDULER_JOB_PAGE_SIZE,
            pageToken: paginationTokens.legacyNextPageToken,
            legacyAppEngineCron: true,
          });
        } catch (error) {
          if (scheduledJobs.length === 0 && defaultPage.jobs.length === 0) {
            throw error;
          }
        }
      }

      const nextJobs = mergeJobs(scheduledJobs, [...defaultPage.jobs, ...legacyPage.jobs]);
      if (nextJobs.length >= CLOUD_SCHEDULER_JOB_LIMIT) {
        setScheduledJobs(nextJobs.slice(0, CLOUD_SCHEDULER_JOB_LIMIT));
        setPaginationTokens({});
        setIsTruncated(
          Boolean(defaultPage.nextPageToken) ||
            Boolean(legacyPage.nextPageToken) ||
            nextJobs.length > CLOUD_SCHEDULER_JOB_LIMIT,
        );
      } else {
        setScheduledJobs(nextJobs);
        setPaginationTokens({
          defaultNextPageToken: defaultPage.nextPageToken,
          legacyNextPageToken: legacyPage.nextPageToken,
        });
      }
    } catch (error) {
      setLoadMoreError(error instanceof Error ? error : new Error(String(error)));
    } finally {
      setIsLoadingMore(false);
    }
  }, [accessToken, isLoadingMore, isTruncated, locationId, paginationTokens, projectId, scheduledJobs]);

  const noopLoadMore = useCallback(async () => undefined, []);

  const { data, isLoading, error } = usePromise(
    async (projId: string, locId: string, token: string) => {
      setScheduledJobs([]);
      setPaginationTokens({});
      setIsTruncated(false);
      setLoadMoreError(undefined);

      const defaultPage = await listFirstNonEmptyCloudSchedulerJobsPage(projId, locId, token, {
        pageSize: CLOUD_SCHEDULER_JOB_PAGE_SIZE,
      });

      let legacyPage: { jobs: CloudSchedulerJob[]; nextPageToken?: string } = { jobs: [] };
      try {
        legacyPage = await listFirstNonEmptyCloudSchedulerJobsPage(projId, locId, token, {
          pageSize: CLOUD_SCHEDULER_JOB_PAGE_SIZE,
          legacyAppEngineCron: true,
        });
      } catch (error) {
        if (defaultPage.jobs.length === 0) {
          throw error;
        }
      }

      const jobs = mergeJobs([], [...defaultPage.jobs, ...legacyPage.jobs]);
      const initialJobs = jobs.slice(0, CLOUD_SCHEDULER_JOB_LIMIT);
      setScheduledJobs(initialJobs);
      setPaginationTokens(
        jobs.length >= CLOUD_SCHEDULER_JOB_LIMIT
          ? {}
          : {
              defaultNextPageToken: defaultPage.nextPageToken,
              legacyNextPageToken: legacyPage.nextPageToken,
            },
      );
      setIsTruncated(
        jobs.length >= CLOUD_SCHEDULER_JOB_LIMIT &&
          (Boolean(defaultPage.nextPageToken) ||
            Boolean(legacyPage.nextPageToken) ||
            jobs.length > CLOUD_SCHEDULER_JOB_LIMIT),
      );

      return initialJobs;
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

  const loadedJobs = scheduledJobs.length > 0 ? scheduledJobs : (data ?? []);

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
    error: undefined,
  };
};

import { useCallback, useState } from "react";
import { usePromise } from "@raycast/utils";
import { useGoogleApi } from "../auth/google";
import { listCloudRunJobsPage } from "./api";
import { CloudRunDeployment } from "./types";

const CLOUD_RUN_JOB_PAGE_SIZE = 50;
const CLOUD_RUN_JOB_LIMIT = 500;

type SuccessResult = {
  jobs: CloudRunDeployment[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  isTruncated: boolean;
  loadMore: () => Promise<void>;
  error: undefined;
};

type LoadingResult = {
  jobs: undefined;
  isLoading: true;
  isLoadingMore: false;
  hasMore: false;
  isTruncated: false;
  loadMore: () => Promise<void>;
  error: undefined;
};

type ErrorResult = {
  jobs: undefined;
  isLoading: false;
  isLoadingMore: false;
  hasMore: false;
  isTruncated: false;
  loadMore: () => Promise<void>;
  error: Error;
};

type UseCloudRunJobsResult = SuccessResult | LoadingResult | ErrorResult;

export const useCloudRunJobs = (projectId: string): UseCloudRunJobsResult => {
  const { accessToken } = useGoogleApi();
  const [jobs, setJobs] = useState<CloudRunDeployment[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>();
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState<Error | undefined>();

  const loadMore = useCallback(async () => {
    if (!nextPageToken || isLoadingMore || isTruncated) {
      return;
    }

    setIsLoadingMore(true);
    setLoadMoreError(undefined);
    try {
      const page = await listCloudRunJobsPage(projectId, accessToken, {
        pageSize: CLOUD_RUN_JOB_PAGE_SIZE,
        pageToken: nextPageToken,
      });

      const nextJobs = [...jobs, ...page.deployments];
      if (nextJobs.length >= CLOUD_RUN_JOB_LIMIT) {
        setJobs(nextJobs.slice(0, CLOUD_RUN_JOB_LIMIT));
        setNextPageToken(undefined);
        setIsTruncated(Boolean(page.nextPageToken) || nextJobs.length > CLOUD_RUN_JOB_LIMIT);
      } else {
        setJobs(nextJobs);
        setNextPageToken(page.nextPageToken);
      }
    } catch (error) {
      setLoadMoreError(error instanceof Error ? error : new Error(String(error)));
    } finally {
      setIsLoadingMore(false);
    }
  }, [accessToken, jobs, isLoadingMore, isTruncated, nextPageToken, projectId]);

  const noopLoadMore = useCallback(async () => undefined, []);

  const { isLoading, error } = usePromise(
    async (projId: string, token: string) => {
      setJobs([]);
      setNextPageToken(undefined);
      setIsTruncated(false);
      setLoadMoreError(undefined);

      const page = await listCloudRunJobsPage(projId, token, {
        pageSize: CLOUD_RUN_JOB_PAGE_SIZE,
      });

      setJobs(page.deployments.slice(0, CLOUD_RUN_JOB_LIMIT));
      setNextPageToken(page.deployments.length >= CLOUD_RUN_JOB_LIMIT ? undefined : page.nextPageToken);
      setIsTruncated(page.deployments.length >= CLOUD_RUN_JOB_LIMIT && Boolean(page.nextPageToken));
    },
    [projectId, accessToken],
  );

  const resultError = error || loadMoreError;

  if (resultError) {
    return {
      jobs: undefined,
      isLoading: false,
      isLoadingMore: false,
      hasMore: false,
      isTruncated: false,
      loadMore: noopLoadMore,
      error: resultError,
    };
  }

  if (isLoading && jobs.length === 0) {
    return {
      jobs: undefined,
      isLoading: true,
      isLoadingMore: false,
      hasMore: false,
      isTruncated: false,
      loadMore: noopLoadMore,
      error: undefined,
    };
  }

  return {
    jobs,
    isLoading,
    isLoadingMore,
    hasMore: Boolean(nextPageToken),
    isTruncated,
    loadMore,
    error: undefined,
  };
};

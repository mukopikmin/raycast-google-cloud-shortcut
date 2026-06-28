import { useCallback, useState } from "react";
import { usePromise } from "@raycast/utils";
import { useGoogleApi } from "../../auth/google";
import { listCloudRunWorkerPoolsPage } from "./api";
import { CloudRunDeployment } from "./types";

const CLOUD_RUN_WORKER_POOL_PAGE_SIZE = 50;
const CLOUD_RUN_WORKER_POOL_LIMIT = 500;

type SuccessResult = {
  workerPools: CloudRunDeployment[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  isTruncated: boolean;
  loadMore: () => Promise<void>;
  error: undefined;
};

type LoadingResult = {
  workerPools: undefined;
  isLoading: true;
  isLoadingMore: false;
  hasMore: false;
  isTruncated: false;
  loadMore: () => Promise<void>;
  error: undefined;
};

type ErrorResult = {
  workerPools: undefined;
  isLoading: false;
  isLoadingMore: false;
  hasMore: false;
  isTruncated: false;
  loadMore: () => Promise<void>;
  error: Error;
};

type UseCloudRunWorkerPoolsResult = SuccessResult | LoadingResult | ErrorResult;

export const useCloudRunWorkerPools = (projectId: string): UseCloudRunWorkerPoolsResult => {
  const { accessToken } = useGoogleApi();
  const [workerPools, setWorkerPools] = useState<CloudRunDeployment[]>([]);
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
      const page = await listCloudRunWorkerPoolsPage(projectId, accessToken, {
        pageSize: CLOUD_RUN_WORKER_POOL_PAGE_SIZE,
        pageToken: nextPageToken,
      });

      const nextWorkerPools = [...workerPools, ...page.deployments];
      if (nextWorkerPools.length >= CLOUD_RUN_WORKER_POOL_LIMIT) {
        setWorkerPools(nextWorkerPools.slice(0, CLOUD_RUN_WORKER_POOL_LIMIT));
        setNextPageToken(undefined);
        setIsTruncated(Boolean(page.nextPageToken) || nextWorkerPools.length > CLOUD_RUN_WORKER_POOL_LIMIT);
      } else {
        setWorkerPools(nextWorkerPools);
        setNextPageToken(page.nextPageToken);
      }
    } catch (error) {
      setLoadMoreError(error instanceof Error ? error : new Error(String(error)));
    } finally {
      setIsLoadingMore(false);
    }
  }, [accessToken, workerPools, isLoadingMore, isTruncated, nextPageToken, projectId]);

  const noopLoadMore = useCallback(async () => undefined, []);

  const { isLoading, error } = usePromise(
    async (projId: string, token: string) => {
      setWorkerPools([]);
      setNextPageToken(undefined);
      setIsTruncated(false);
      setLoadMoreError(undefined);

      const page = await listCloudRunWorkerPoolsPage(projId, token, {
        pageSize: CLOUD_RUN_WORKER_POOL_PAGE_SIZE,
      });

      setWorkerPools(page.deployments.slice(0, CLOUD_RUN_WORKER_POOL_LIMIT));
      setNextPageToken(page.deployments.length >= CLOUD_RUN_WORKER_POOL_LIMIT ? undefined : page.nextPageToken);
      setIsTruncated(page.deployments.length >= CLOUD_RUN_WORKER_POOL_LIMIT && Boolean(page.nextPageToken));
    },
    [projectId, accessToken],
  );

  const resultError = error || loadMoreError;

  if (resultError) {
    return {
      workerPools: undefined,
      isLoading: false,
      isLoadingMore: false,
      hasMore: false,
      isTruncated: false,
      loadMore: noopLoadMore,
      error: resultError,
    };
  }

  if (isLoading && workerPools.length === 0) {
    return {
      workerPools: undefined,
      isLoading: true,
      isLoadingMore: false,
      hasMore: false,
      isTruncated: false,
      loadMore: noopLoadMore,
      error: undefined,
    };
  }

  return {
    workerPools,
    isLoading,
    isLoadingMore,
    hasMore: Boolean(nextPageToken),
    isTruncated,
    loadMore,
    error: undefined,
  };
};

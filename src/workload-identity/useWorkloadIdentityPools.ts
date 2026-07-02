import { useCallback, useState } from "react";
import { usePromise } from "@raycast/utils";
import { useGoogleApi } from "../auth/google";
import { listWorkloadIdentityPoolsPage } from "./api";
import { WorkloadIdentityPool } from "./types";

const WORKLOAD_IDENTITY_POOL_PAGE_SIZE = 50;
const WORKLOAD_IDENTITY_POOL_LIMIT = 500;

type SuccessResult = {
  pools: WorkloadIdentityPool[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  isTruncated: boolean;
  loadMore: () => Promise<void>;
  error: undefined;
};

type LoadingResult = {
  pools: undefined;
  isLoading: true;
  isLoadingMore: false;
  hasMore: false;
  isTruncated: false;
  loadMore: () => Promise<void>;
  error: undefined;
};

type ErrorResult = {
  pools: undefined;
  isLoading: false;
  isLoadingMore: false;
  hasMore: false;
  isTruncated: false;
  loadMore: () => Promise<void>;
  error: Error;
};

type UseWorkloadIdentityPoolsResult = SuccessResult | LoadingResult | ErrorResult;

export const useWorkloadIdentityPools = (projectId: string): UseWorkloadIdentityPoolsResult => {
  const { accessToken } = useGoogleApi();
  const [pools, setPools] = useState<WorkloadIdentityPool[]>([]);
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
      const page = await listWorkloadIdentityPoolsPage(projectId, accessToken, {
        pageSize: WORKLOAD_IDENTITY_POOL_PAGE_SIZE,
        pageToken: nextPageToken,
      });

      const nextPools = [...pools, ...page.pools];
      if (nextPools.length >= WORKLOAD_IDENTITY_POOL_LIMIT) {
        setPools(nextPools.slice(0, WORKLOAD_IDENTITY_POOL_LIMIT));
        setNextPageToken(undefined);
        setIsTruncated(Boolean(page.nextPageToken) || nextPools.length > WORKLOAD_IDENTITY_POOL_LIMIT);
      } else {
        setPools(nextPools);
        setNextPageToken(page.nextPageToken);
      }
    } catch (error) {
      setLoadMoreError(error instanceof Error ? error : new Error(String(error)));
    } finally {
      setIsLoadingMore(false);
    }
  }, [accessToken, isLoadingMore, isTruncated, nextPageToken, pools, projectId]);

  const noopLoadMore = useCallback(async () => undefined, []);

  const { isLoading, error } = usePromise(
    async (projId: string, token: string) => {
      setPools([]);
      setNextPageToken(undefined);
      setIsTruncated(false);
      setLoadMoreError(undefined);

      const page = await listWorkloadIdentityPoolsPage(projId, token, {
        pageSize: WORKLOAD_IDENTITY_POOL_PAGE_SIZE,
      });

      setPools(page.pools.slice(0, WORKLOAD_IDENTITY_POOL_LIMIT));
      setNextPageToken(page.pools.length >= WORKLOAD_IDENTITY_POOL_LIMIT ? undefined : page.nextPageToken);
      setIsTruncated(page.pools.length >= WORKLOAD_IDENTITY_POOL_LIMIT && Boolean(page.nextPageToken));
    },
    [projectId, accessToken],
  );

  const resultError = error || loadMoreError;
  if (resultError) {
    return {
      pools: undefined,
      isLoading: false,
      isLoadingMore: false,
      hasMore: false,
      isTruncated: false,
      loadMore: noopLoadMore,
      error: resultError,
    };
  }

  if (isLoading && pools.length === 0) {
    return {
      pools: undefined,
      isLoading: true,
      isLoadingMore: false,
      hasMore: false,
      isTruncated: false,
      loadMore: noopLoadMore,
      error: undefined,
    };
  }

  return {
    pools,
    isLoading,
    isLoadingMore,
    hasMore: Boolean(nextPageToken),
    isTruncated,
    loadMore,
    error: undefined,
  };
};

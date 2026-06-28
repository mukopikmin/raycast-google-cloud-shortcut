import { useCallback, useState } from "react";
import { usePromise } from "@raycast/utils";
import { useGoogleApi } from "../../auth/google";
import { listComputeEngineInstancesPage } from "./api";
import { ComputeEngineInstance } from "./types";

const COMPUTE_ENGINE_INSTANCE_PAGE_SIZE = 50;
const COMPUTE_ENGINE_INSTANCE_LIMIT = 500;

type SuccessResult = {
  instances: ComputeEngineInstance[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  isTruncated: boolean;
  loadMore: () => Promise<void>;
  error: undefined;
};

type LoadingResult = {
  instances: undefined;
  isLoading: true;
  isLoadingMore: false;
  hasMore: false;
  isTruncated: false;
  loadMore: () => Promise<void>;
  error: undefined;
};

type ErrorResult = {
  instances: undefined;
  isLoading: false;
  isLoadingMore: false;
  hasMore: false;
  isTruncated: false;
  loadMore: () => Promise<void>;
  error: Error;
};

type UseComputeEngineInstancesResult = SuccessResult | LoadingResult | ErrorResult;

export const useComputeEngineInstances = (projectId: string): UseComputeEngineInstancesResult => {
  const { accessToken } = useGoogleApi();
  const [instances, setInstances] = useState<ComputeEngineInstance[]>([]);
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
      const page = await listComputeEngineInstancesPage(projectId, accessToken, {
        pageSize: COMPUTE_ENGINE_INSTANCE_PAGE_SIZE,
        pageToken: nextPageToken,
      });

      const nextInstances = [...instances, ...page.instances];
      if (nextInstances.length >= COMPUTE_ENGINE_INSTANCE_LIMIT) {
        setInstances(nextInstances.slice(0, COMPUTE_ENGINE_INSTANCE_LIMIT));
        setNextPageToken(undefined);
        setIsTruncated(Boolean(page.nextPageToken) || nextInstances.length > COMPUTE_ENGINE_INSTANCE_LIMIT);
      } else {
        setInstances(nextInstances);
        setNextPageToken(page.nextPageToken);
      }
    } catch (error) {
      setLoadMoreError(error instanceof Error ? error : new Error(String(error)));
    } finally {
      setIsLoadingMore(false);
    }
  }, [accessToken, instances, isLoadingMore, isTruncated, nextPageToken, projectId]);

  const noopLoadMore = useCallback(async () => undefined, []);

  const { isLoading, error } = usePromise(
    async (projId: string, token: string) => {
      setInstances([]);
      setNextPageToken(undefined);
      setIsTruncated(false);
      setLoadMoreError(undefined);

      const page = await listComputeEngineInstancesPage(projId, token, {
        pageSize: COMPUTE_ENGINE_INSTANCE_PAGE_SIZE,
      });

      setInstances(page.instances.slice(0, COMPUTE_ENGINE_INSTANCE_LIMIT));
      setNextPageToken(page.instances.length >= COMPUTE_ENGINE_INSTANCE_LIMIT ? undefined : page.nextPageToken);
      setIsTruncated(page.instances.length >= COMPUTE_ENGINE_INSTANCE_LIMIT && Boolean(page.nextPageToken));
    },
    [projectId, accessToken],
  );

  const resultError = error || loadMoreError;

  if (resultError) {
    return {
      instances: undefined,
      isLoading: false,
      isLoadingMore: false,
      hasMore: false,
      isTruncated: false,
      loadMore: noopLoadMore,
      error: resultError,
    };
  }

  if (isLoading && instances.length === 0) {
    return {
      instances: undefined,
      isLoading: true,
      isLoadingMore: false,
      hasMore: false,
      isTruncated: false,
      loadMore: noopLoadMore,
      error: undefined,
    };
  }

  return {
    instances,
    isLoading,
    isLoadingMore,
    hasMore: Boolean(nextPageToken),
    isTruncated,
    loadMore,
    error: undefined,
  };
};

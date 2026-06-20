import { useCallback, useState } from "react";
import { usePromise } from "@raycast/utils";
import { useGoogleApi } from "../auth/google";
import { listKubernetesEngineClustersPage } from "./api";
import { KubernetesEngineCluster } from "./types";

const KUBERNETES_ENGINE_CLUSTER_PAGE_SIZE = 50;
const KUBERNETES_ENGINE_CLUSTER_LIMIT = 500;

type SuccessResult = {
  clusters: KubernetesEngineCluster[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  isTruncated: boolean;
  loadMore: () => Promise<void>;
  error: undefined;
};

type LoadingResult = {
  clusters: undefined;
  isLoading: true;
  isLoadingMore: false;
  hasMore: false;
  isTruncated: false;
  loadMore: () => Promise<void>;
  error: undefined;
};

type ErrorResult = {
  clusters: undefined;
  isLoading: false;
  isLoadingMore: false;
  hasMore: false;
  isTruncated: false;
  loadMore: () => Promise<void>;
  error: Error;
};

type UseKubernetesEngineClustersResult = SuccessResult | LoadingResult | ErrorResult;

export const useKubernetesEngineClusters = (projectId: string): UseKubernetesEngineClustersResult => {
  const { accessToken } = useGoogleApi();
  const [clusters, setClusters] = useState<KubernetesEngineCluster[]>([]);
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
      const page = await listKubernetesEngineClustersPage(projectId, accessToken, {
        pageSize: KUBERNETES_ENGINE_CLUSTER_PAGE_SIZE,
        pageToken: nextPageToken,
      });

      const nextClusters = [...clusters, ...page.clusters];
      if (nextClusters.length >= KUBERNETES_ENGINE_CLUSTER_LIMIT) {
        setClusters(nextClusters.slice(0, KUBERNETES_ENGINE_CLUSTER_LIMIT));
        setNextPageToken(undefined);
        setIsTruncated(Boolean(page.nextPageToken) || nextClusters.length > KUBERNETES_ENGINE_CLUSTER_LIMIT);
      } else {
        setClusters(nextClusters);
        setNextPageToken(page.nextPageToken);
      }
    } catch (error) {
      setLoadMoreError(error instanceof Error ? error : new Error(String(error)));
    } finally {
      setIsLoadingMore(false);
    }
  }, [accessToken, clusters, isLoadingMore, isTruncated, nextPageToken, projectId]);

  const noopLoadMore = useCallback(async () => undefined, []);

  const { isLoading, error } = usePromise(
    async (projId: string, token: string) => {
      setClusters([]);
      setNextPageToken(undefined);
      setIsTruncated(false);
      setLoadMoreError(undefined);

      const page = await listKubernetesEngineClustersPage(projId, token, {
        pageSize: KUBERNETES_ENGINE_CLUSTER_PAGE_SIZE,
      });

      setClusters(page.clusters.slice(0, KUBERNETES_ENGINE_CLUSTER_LIMIT));
      setNextPageToken(page.clusters.length >= KUBERNETES_ENGINE_CLUSTER_LIMIT ? undefined : page.nextPageToken);
      setIsTruncated(page.clusters.length >= KUBERNETES_ENGINE_CLUSTER_LIMIT && Boolean(page.nextPageToken));
    },
    [projectId, accessToken],
  );

  const resultError = error || loadMoreError;

  if (resultError) {
    return {
      clusters: undefined,
      isLoading: false,
      isLoadingMore: false,
      hasMore: false,
      isTruncated: false,
      loadMore: noopLoadMore,
      error: resultError,
    };
  }

  if (isLoading && clusters.length === 0) {
    return {
      clusters: undefined,
      isLoading: true,
      isLoadingMore: false,
      hasMore: false,
      isTruncated: false,
      loadMore: noopLoadMore,
      error: undefined,
    };
  }

  return {
    clusters,
    isLoading,
    isLoadingMore,
    hasMore: Boolean(nextPageToken),
    isTruncated,
    loadMore,
    error: undefined,
  };
};

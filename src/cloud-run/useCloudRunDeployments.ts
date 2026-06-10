import { useCallback } from "react";
import { CloudRunDeployment } from "./types";
import { useCloudRunJobs } from "./useCloudRunJobs";
import { useCloudRunServices } from "./useCloudRunServices";
import { useCloudRunWorkerPools } from "./useCloudRunWorkerPools";

type SuccessResult = {
  deployments: CloudRunDeployment[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  isTruncated: boolean;
  loadMore: () => Promise<void>;
  error: undefined;
};

type LoadingResult = {
  deployments: undefined;
  isLoading: true;
  isLoadingMore: false;
  hasMore: false;
  isTruncated: false;
  loadMore: () => Promise<void>;
  error: undefined;
};

type ErrorResult = {
  deployments: undefined;
  isLoading: false;
  isLoadingMore: false;
  hasMore: false;
  isTruncated: false;
  loadMore: () => Promise<void>;
  error: Error;
};

type UseCloudRunDeploymentsResult = SuccessResult | LoadingResult | ErrorResult;

export const useCloudRunDeployments = (projectId: string): UseCloudRunDeploymentsResult => {
  const {
    services,
    isLoading: isLoadingServices,
    isLoadingMore: isLoadingMoreServices,
    hasMore: hasMoreServices,
    isTruncated: isTruncatedServices,
    loadMore: loadMoreServices,
    error: errorServices,
  } = useCloudRunServices(projectId);
  const {
    jobs,
    isLoading: isLoadingJobs,
    isLoadingMore: isLoadingMoreJobs,
    hasMore: hasMoreJobs,
    isTruncated: isTruncatedJobs,
    loadMore: loadMoreJobs,
    error: errorJobs,
  } = useCloudRunJobs(projectId);
  const {
    workerPools,
    isLoading: isLoadingWorkerPools,
    isLoadingMore: isLoadingMoreWorkerPools,
    hasMore: hasMoreWorkerPools,
    isTruncated: isTruncatedWorkerPools,
    loadMore: loadMoreWorkerPools,
    error: errorWorkerPools,
  } = useCloudRunWorkerPools(projectId);

  // Load more sequentially: services first, then jobs, then worker pools
  const loadMore = useCallback(async () => {
    if (hasMoreServices) {
      await loadMoreServices();
    } else if (hasMoreJobs) {
      await loadMoreJobs();
    } else if (hasMoreWorkerPools) {
      await loadMoreWorkerPools();
    }
  }, [hasMoreServices, hasMoreJobs, hasMoreWorkerPools, loadMoreServices, loadMoreJobs, loadMoreWorkerPools]);

  const noopLoadMore = useCallback(async () => undefined, []);

  const error = errorServices || errorJobs || errorWorkerPools;

  if (error) {
    return {
      deployments: undefined,
      isLoading: false,
      isLoadingMore: false,
      hasMore: false,
      isTruncated: false,
      loadMore: noopLoadMore,
      error,
    };
  }

  const isLoading = isLoadingServices || isLoadingJobs || isLoadingWorkerPools;

  if (isLoading && !services && !jobs && !workerPools) {
    return {
      deployments: undefined,
      isLoading: true,
      isLoadingMore: false,
      hasMore: false,
      isTruncated: false,
      loadMore: noopLoadMore,
      error: undefined,
    };
  }

  return {
    deployments: [...(services ?? []), ...(jobs ?? []), ...(workerPools ?? [])],
    isLoading,
    isLoadingMore: isLoadingMoreServices || isLoadingMoreJobs || isLoadingMoreWorkerPools,
    hasMore: hasMoreServices || hasMoreJobs || hasMoreWorkerPools,
    isTruncated: isTruncatedServices || isTruncatedJobs || isTruncatedWorkerPools,
    loadMore,
    error: undefined,
  };
};

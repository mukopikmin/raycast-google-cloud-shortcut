import { useCallback, useState } from "react";
import { usePromise } from "@raycast/utils";
import { useGoogleApi } from "../auth/google";
import { listCloudRunServicesPage } from "./api";
import { CloudRunDeployment } from "./types";

const CLOUD_RUN_SERVICE_PAGE_SIZE = 50;
const CLOUD_RUN_SERVICE_LIMIT = 500;

type SuccessResult = {
  services: CloudRunDeployment[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  isTruncated: boolean;
  loadMore: () => Promise<void>;
  error: undefined;
};

type LoadingResult = {
  services: undefined;
  isLoading: true;
  isLoadingMore: false;
  hasMore: false;
  isTruncated: false;
  loadMore: () => Promise<void>;
  error: undefined;
};

type ErrorResult = {
  services: undefined;
  isLoading: false;
  isLoadingMore: false;
  hasMore: false;
  isTruncated: false;
  loadMore: () => Promise<void>;
  error: Error;
};

type UseCloudRunServicesResult = SuccessResult | LoadingResult | ErrorResult;

export const useCloudRunServices = (projectId: string): UseCloudRunServicesResult => {
  const { accessToken } = useGoogleApi();
  const [services, setServices] = useState<CloudRunDeployment[]>([]);
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
      const page = await listCloudRunServicesPage(projectId, accessToken, {
        pageSize: CLOUD_RUN_SERVICE_PAGE_SIZE,
        pageToken: nextPageToken,
      });

      const nextServices = [...services, ...page.deployments];
      if (nextServices.length >= CLOUD_RUN_SERVICE_LIMIT) {
        setServices(nextServices.slice(0, CLOUD_RUN_SERVICE_LIMIT));
        setNextPageToken(undefined);
        setIsTruncated(Boolean(page.nextPageToken) || nextServices.length > CLOUD_RUN_SERVICE_LIMIT);
      } else {
        setServices(nextServices);
        setNextPageToken(page.nextPageToken);
      }
    } catch (error) {
      setLoadMoreError(error instanceof Error ? error : new Error(String(error)));
    } finally {
      setIsLoadingMore(false);
    }
  }, [accessToken, services, isLoadingMore, isTruncated, nextPageToken, projectId]);

  const noopLoadMore = useCallback(async () => undefined, []);

  const { isLoading, error } = usePromise(
    async (projId: string, token: string) => {
      setServices([]);
      setNextPageToken(undefined);
      setIsTruncated(false);
      setLoadMoreError(undefined);

      const page = await listCloudRunServicesPage(projId, token, {
        pageSize: CLOUD_RUN_SERVICE_PAGE_SIZE,
      });

      setServices(page.deployments.slice(0, CLOUD_RUN_SERVICE_LIMIT));
      setNextPageToken(page.deployments.length >= CLOUD_RUN_SERVICE_LIMIT ? undefined : page.nextPageToken);
      setIsTruncated(page.deployments.length >= CLOUD_RUN_SERVICE_LIMIT && Boolean(page.nextPageToken));
    },
    [projectId, accessToken],
  );

  const resultError = error || loadMoreError;

  if (resultError) {
    return {
      services: undefined,
      isLoading: false,
      isLoadingMore: false,
      hasMore: false,
      isTruncated: false,
      loadMore: noopLoadMore,
      error: resultError,
    };
  }

  if (isLoading && services.length === 0) {
    return {
      services: undefined,
      isLoading: true,
      isLoadingMore: false,
      hasMore: false,
      isTruncated: false,
      loadMore: noopLoadMore,
      error: undefined,
    };
  }

  return {
    services,
    isLoading,
    isLoadingMore,
    hasMore: Boolean(nextPageToken),
    isTruncated,
    loadMore,
    error: undefined,
  };
};

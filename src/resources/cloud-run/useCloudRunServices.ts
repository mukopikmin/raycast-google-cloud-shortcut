import { useCallback, useState } from "react";
import { usePromise } from "@raycast/utils";
import { useGoogleApi } from "../../auth/google";
import { listCloudRunLocations, listCloudRunServicesPage } from "./api";
import { CloudRunDeployment } from "./types";

const CLOUD_RUN_SERVICE_PAGE_SIZE = 50;
const CLOUD_RUN_SERVICE_LIMIT = 500;

type PaginationTokens = Record<string, string>;

const isNotFoundError = (error: unknown) => error instanceof Error && error.message.includes("Failed to fetch (404)");

const listCloudRunServicesPageOrEmpty = async (
  projectId: string,
  locationId: string,
  accessToken: string,
  options: { pageSize: number; pageToken?: string },
) => {
  try {
    return await listCloudRunServicesPage(projectId, locationId, accessToken, options);
  } catch (error) {
    if (isNotFoundError(error)) {
      return { deployments: [], nextPageToken: undefined };
    }

    throw error;
  }
};

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
  const [paginationTokens, setPaginationTokens] = useState<PaginationTokens>({});
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState<Error | undefined>();

  const loadMore = useCallback(async () => {
    const regions = Object.keys(paginationTokens);
    if (regions.length === 0 || isLoadingMore || isTruncated) {
      return;
    }

    setIsLoadingMore(true);
    setLoadMoreError(undefined);
    try {
      const pages = await Promise.all(
        regions.map(async (region) => ({
          region,
          page: await listCloudRunServicesPageOrEmpty(projectId, region, accessToken, {
            pageSize: CLOUD_RUN_SERVICE_PAGE_SIZE,
            pageToken: paginationTokens[region],
          }),
        })),
      );

      const nextServices = [...services, ...pages.flatMap(({ page }) => page.deployments)];
      if (nextServices.length >= CLOUD_RUN_SERVICE_LIMIT) {
        setServices(nextServices.slice(0, CLOUD_RUN_SERVICE_LIMIT));
        setPaginationTokens({});
        setIsTruncated(
          pages.some(({ page }) => Boolean(page.nextPageToken)) || nextServices.length > CLOUD_RUN_SERVICE_LIMIT,
        );
      } else {
        setServices(nextServices);
        setPaginationTokens(
          Object.fromEntries(
            pages.flatMap(({ region, page }) => (page.nextPageToken ? [[region, page.nextPageToken]] : [])),
          ),
        );
      }
    } catch (error) {
      setLoadMoreError(error instanceof Error ? error : new Error(String(error)));
    } finally {
      setIsLoadingMore(false);
    }
  }, [accessToken, services, isLoadingMore, isTruncated, paginationTokens, projectId]);

  const noopLoadMore = useCallback(async () => undefined, []);

  const { isLoading, error } = usePromise(
    async (projId: string, token: string) => {
      setServices([]);
      setPaginationTokens({});
      setIsTruncated(false);
      setLoadMoreError(undefined);

      const locations = await listCloudRunLocations(projId, token);
      const pages = await Promise.all(
        locations.map(async (location) => ({
          region: location.id,
          page: await listCloudRunServicesPageOrEmpty(projId, location.id, token, {
            pageSize: CLOUD_RUN_SERVICE_PAGE_SIZE,
          }),
        })),
      );

      const nextServices = pages.flatMap(({ page }) => page.deployments);
      setServices(nextServices.slice(0, CLOUD_RUN_SERVICE_LIMIT));
      setPaginationTokens(
        nextServices.length >= CLOUD_RUN_SERVICE_LIMIT
          ? {}
          : Object.fromEntries(
              pages.flatMap(({ region, page }) => (page.nextPageToken ? [[region, page.nextPageToken]] : [])),
            ),
      );
      setIsTruncated(
        nextServices.length >= CLOUD_RUN_SERVICE_LIMIT && pages.some(({ page }) => Boolean(page.nextPageToken)),
      );
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
    hasMore: Object.keys(paginationTokens).length > 0,
    isTruncated,
    loadMore,
    error: undefined,
  };
};

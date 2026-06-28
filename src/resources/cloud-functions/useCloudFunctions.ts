import { useCallback, useState } from "react";
import { usePromise } from "@raycast/utils";
import { useGoogleApi } from "../../auth/google";
import { listCloudFunctionsPage } from "./api";
import { CloudFunction } from "./types";

const CLOUD_FUNCTION_PAGE_SIZE = 50;
const CLOUD_FUNCTION_LIMIT = 500;

type SuccessResult = {
  functions: CloudFunction[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  isTruncated: boolean;
  loadMore: () => Promise<void>;
  error: undefined;
};

type LoadingResult = {
  functions: undefined;
  isLoading: true;
  isLoadingMore: false;
  hasMore: false;
  isTruncated: false;
  loadMore: () => Promise<void>;
  error: undefined;
};

type ErrorResult = {
  functions: undefined;
  isLoading: false;
  isLoadingMore: false;
  hasMore: false;
  isTruncated: false;
  loadMore: () => Promise<void>;
  error: Error;
};

type UseCloudFunctionsResult = SuccessResult | LoadingResult | ErrorResult;

export const useCloudFunctions = (projectId: string): UseCloudFunctionsResult => {
  const { accessToken } = useGoogleApi();
  const [functions, setFunctions] = useState<CloudFunction[]>([]);
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
      const page = await listCloudFunctionsPage(projectId, accessToken, {
        pageSize: CLOUD_FUNCTION_PAGE_SIZE,
        pageToken: nextPageToken,
      });

      const nextFunctions = [...functions, ...page.functions];
      if (nextFunctions.length >= CLOUD_FUNCTION_LIMIT) {
        setFunctions(nextFunctions.slice(0, CLOUD_FUNCTION_LIMIT));
        setNextPageToken(undefined);
        setIsTruncated(Boolean(page.nextPageToken) || nextFunctions.length > CLOUD_FUNCTION_LIMIT);
      } else {
        setFunctions(nextFunctions);
        setNextPageToken(page.nextPageToken);
      }
    } catch (error) {
      setLoadMoreError(error instanceof Error ? error : new Error(String(error)));
    } finally {
      setIsLoadingMore(false);
    }
  }, [accessToken, functions, isLoadingMore, isTruncated, nextPageToken, projectId]);

  const noopLoadMore = useCallback(async () => undefined, []);

  const { isLoading, error } = usePromise(
    async (projId: string, token: string) => {
      setFunctions([]);
      setNextPageToken(undefined);
      setIsTruncated(false);
      setLoadMoreError(undefined);

      const page = await listCloudFunctionsPage(projId, token, {
        pageSize: CLOUD_FUNCTION_PAGE_SIZE,
      });

      setFunctions(page.functions.slice(0, CLOUD_FUNCTION_LIMIT));
      setNextPageToken(page.functions.length >= CLOUD_FUNCTION_LIMIT ? undefined : page.nextPageToken);
      setIsTruncated(page.functions.length >= CLOUD_FUNCTION_LIMIT && Boolean(page.nextPageToken));
    },
    [projectId, accessToken],
  );

  const resultError = error || loadMoreError;

  if (resultError) {
    return {
      functions: undefined,
      isLoading: false,
      isLoadingMore: false,
      hasMore: false,
      isTruncated: false,
      loadMore: noopLoadMore,
      error: resultError,
    };
  }

  if (isLoading && functions.length === 0) {
    return {
      functions: undefined,
      isLoading: true,
      isLoadingMore: false,
      hasMore: false,
      isTruncated: false,
      loadMore: noopLoadMore,
      error: undefined,
    };
  }

  return {
    functions,
    isLoading,
    isLoadingMore,
    hasMore: Boolean(nextPageToken),
    isTruncated,
    loadMore,
    error: undefined,
  };
};

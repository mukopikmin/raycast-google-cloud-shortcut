import { useCallback, useState } from "react";
import { usePromise } from "@raycast/utils";
import { useGoogleApi } from "../auth/google";
import { listCloudStorageBucketsPage } from "./api";
import { CloudStorageBucket } from "./types";

const CLOUD_STORAGE_BUCKET_PAGE_SIZE = 50;
const CLOUD_STORAGE_BUCKET_LIMIT = 500;

type SuccessResult = {
  buckets: CloudStorageBucket[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  isTruncated: boolean;
  loadMore: () => Promise<void>;
  error: undefined;
};

type LoadingResult = {
  buckets: undefined;
  isLoading: true;
  isLoadingMore: false;
  hasMore: false;
  isTruncated: false;
  loadMore: () => Promise<void>;
  error: undefined;
};

type ErrorResult = {
  buckets: undefined;
  isLoading: false;
  isLoadingMore: false;
  hasMore: false;
  isTruncated: false;
  loadMore: () => Promise<void>;
  error: Error;
};

type UseCloudStorageResult = SuccessResult | LoadingResult | ErrorResult;

export const useCloudStorage = (projectId: string): UseCloudStorageResult => {
  const { accessToken } = useGoogleApi();
  const [buckets, setBuckets] = useState<CloudStorageBucket[]>([]);
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
      const page = await listCloudStorageBucketsPage(projectId, accessToken, {
        pageSize: CLOUD_STORAGE_BUCKET_PAGE_SIZE,
        pageToken: nextPageToken,
      });

      const nextBuckets = [...buckets, ...page.buckets];
      if (nextBuckets.length >= CLOUD_STORAGE_BUCKET_LIMIT) {
        setBuckets(nextBuckets.slice(0, CLOUD_STORAGE_BUCKET_LIMIT));
        setNextPageToken(undefined);
        setIsTruncated(Boolean(page.nextPageToken) || nextBuckets.length > CLOUD_STORAGE_BUCKET_LIMIT);
      } else {
        setBuckets(nextBuckets);
        setNextPageToken(page.nextPageToken);
      }
    } catch (error) {
      setLoadMoreError(error instanceof Error ? error : new Error(String(error)));
    } finally {
      setIsLoadingMore(false);
    }
  }, [accessToken, buckets, isLoadingMore, isTruncated, nextPageToken, projectId]);

  const noopLoadMore = useCallback(async () => undefined, []);

  const { isLoading, error } = usePromise(
    async (projId: string, token: string) => {
      setBuckets([]);
      setNextPageToken(undefined);
      setIsTruncated(false);
      setLoadMoreError(undefined);

      const page = await listCloudStorageBucketsPage(projId, token, {
        pageSize: CLOUD_STORAGE_BUCKET_PAGE_SIZE,
      });

      setBuckets(page.buckets.slice(0, CLOUD_STORAGE_BUCKET_LIMIT));
      setNextPageToken(page.buckets.length >= CLOUD_STORAGE_BUCKET_LIMIT ? undefined : page.nextPageToken);
      setIsTruncated(page.buckets.length >= CLOUD_STORAGE_BUCKET_LIMIT && Boolean(page.nextPageToken));
    },
    [projectId, accessToken],
  );

  const resultError = error || loadMoreError;

  if (resultError) {
    return {
      buckets: undefined,
      isLoading: false,
      isLoadingMore: false,
      hasMore: false,
      isTruncated: false,
      loadMore: noopLoadMore,
      error: resultError,
    };
  }

  if (isLoading && buckets.length === 0) {
    return {
      buckets: undefined,
      isLoading: true,
      isLoadingMore: false,
      hasMore: false,
      isTruncated: false,
      loadMore: noopLoadMore,
      error: undefined,
    };
  }

  return {
    buckets,
    isLoading,
    isLoadingMore,
    hasMore: Boolean(nextPageToken),
    isTruncated,
    loadMore,
    error: undefined,
  };
};

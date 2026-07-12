import { useCallback, useMemo, useState } from "react";
import { usePromise } from "@raycast/utils";
import { useGoogleApi } from "../../auth/google";
import { listPubSubSubscriptionsPage, listPubSubTopicsPage } from "./api";
import { PubSubResource } from "./types";

const PUBSUB_PAGE_SIZE = 50;
const PUBSUB_RESOURCE_LIMIT = 500;

type SuccessResult = {
  resources: PubSubResource[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  isTruncated: boolean;
  loadMore: () => Promise<void>;
  error: undefined;
};

type LoadingResult = {
  resources: undefined;
  isLoading: true;
  isLoadingMore: false;
  hasMore: false;
  isTruncated: false;
  loadMore: () => Promise<void>;
  error: undefined;
};

type ErrorResult = {
  resources: undefined;
  isLoading: false;
  isLoadingMore: false;
  hasMore: false;
  isTruncated: false;
  loadMore: () => Promise<void>;
  error: Error;
};

type UsePubSubResourcesResult = SuccessResult | LoadingResult | ErrorResult;

export const usePubSubResources = (projectId: string): UsePubSubResourcesResult => {
  const { accessToken } = useGoogleApi();

  const [resources, setResources] = useState<PubSubResource[]>([]);
  const [topicNextPageToken, setTopicNextPageToken] = useState<string | undefined>();
  const [subscriptionNextPageToken, setSubscriptionNextPageToken] = useState<string | undefined>();
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState<Error | undefined>();

  const hasMore = useMemo(
    () => Boolean(topicNextPageToken) || Boolean(subscriptionNextPageToken),
    [subscriptionNextPageToken, topicNextPageToken],
  );

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore || isTruncated) {
      return;
    }

    setIsLoadingMore(true);
    setLoadMoreError(undefined);

    try {
      const [topicsPage, subscriptionsPage] = await Promise.all([
        topicNextPageToken
          ? listPubSubTopicsPage(projectId, accessToken, { pageSize: PUBSUB_PAGE_SIZE, pageToken: topicNextPageToken })
          : Promise.resolve({ topics: [], nextPageToken: undefined }),
        subscriptionNextPageToken
          ? listPubSubSubscriptionsPage(projectId, accessToken, {
              pageSize: PUBSUB_PAGE_SIZE,
              pageToken: subscriptionNextPageToken,
            })
          : Promise.resolve({ subscriptions: [], nextPageToken: undefined }),
      ]);

      const mergedResources = [...resources, ...topicsPage.topics, ...subscriptionsPage.subscriptions];
      if (mergedResources.length >= PUBSUB_RESOURCE_LIMIT) {
        setResources(mergedResources.slice(0, PUBSUB_RESOURCE_LIMIT));
        setTopicNextPageToken(undefined);
        setSubscriptionNextPageToken(undefined);
        setIsTruncated(Boolean(topicsPage.nextPageToken) || Boolean(subscriptionsPage.nextPageToken));
      } else {
        setResources(mergedResources);
        setTopicNextPageToken(topicsPage.nextPageToken);
        setSubscriptionNextPageToken(subscriptionsPage.nextPageToken);
      }
    } catch (error) {
      setLoadMoreError(error instanceof Error ? error : new Error(String(error)));
    } finally {
      setIsLoadingMore(false);
    }
  }, [
    accessToken,
    hasMore,
    isLoadingMore,
    isTruncated,
    projectId,
    resources,
    subscriptionNextPageToken,
    topicNextPageToken,
  ]);

  const noopLoadMore = useCallback(async () => undefined, []);

  const { isLoading, error } = usePromise(
    async (projId: string, token: string) => {
      setResources([]);
      setTopicNextPageToken(undefined);
      setSubscriptionNextPageToken(undefined);
      setIsTruncated(false);
      setLoadMoreError(undefined);

      const [topicsPage, subscriptionsPage] = await Promise.all([
        listPubSubTopicsPage(projId, token, { pageSize: PUBSUB_PAGE_SIZE }),
        listPubSubSubscriptionsPage(projId, token, { pageSize: PUBSUB_PAGE_SIZE }),
      ]);

      const nextResources = [...topicsPage.topics, ...subscriptionsPage.subscriptions];
      if (nextResources.length >= PUBSUB_RESOURCE_LIMIT) {
        setResources(nextResources.slice(0, PUBSUB_RESOURCE_LIMIT));
        setTopicNextPageToken(undefined);
        setSubscriptionNextPageToken(undefined);
        setIsTruncated(Boolean(topicsPage.nextPageToken) || Boolean(subscriptionsPage.nextPageToken));
      } else {
        setResources(nextResources);
        setTopicNextPageToken(topicsPage.nextPageToken);
        setSubscriptionNextPageToken(subscriptionsPage.nextPageToken);
      }
    },
    [projectId, accessToken],
  );

  const resultError = error || loadMoreError;
  if (resultError) {
    return {
      resources: undefined,
      isLoading: false,
      isLoadingMore: false,
      hasMore: false,
      isTruncated: false,
      loadMore: noopLoadMore,
      error: resultError,
    };
  }

  if (isLoading && resources.length === 0) {
    return {
      resources: undefined,
      isLoading: true,
      isLoadingMore: false,
      hasMore: false,
      isTruncated: false,
      loadMore: noopLoadMore,
      error: undefined,
    };
  }

  return {
    resources,
    isLoading,
    isLoadingMore,
    hasMore,
    isTruncated,
    loadMore,
    error: undefined,
  };
};

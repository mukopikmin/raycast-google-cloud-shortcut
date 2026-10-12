import { appendResourcePage } from "../../pagination/pages";
import { useCallback, useMemo, useState, useRef } from "react";
import { usePromise } from "@raycast/utils";
import { useGoogleApi } from "../../auth/google";
import { listPubSubSubscriptionsPage, listPubSubTopicsPage } from "./api";
import { PubSubResource } from "./types";

const PUBSUB_PAGE_SIZE = 50;

type SuccessResult = {
  resources: PubSubResource[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  isTruncated: boolean;
  loadMore: () => Promise<void>;
  error: undefined;
  reload: () => Promise<void>;
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
  const loadingMore = useRef(false);
  const generation = useRef(0);

  const hasMore = useMemo(
    () => Boolean(topicNextPageToken) || Boolean(subscriptionNextPageToken),
    [subscriptionNextPageToken, topicNextPageToken],
  );

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore.current) {
      return;
    }

    const requestGeneration = generation.current;
    loadingMore.current = true;
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

      if (requestGeneration !== generation.current) return;
      const next = appendResourcePage(
        { resources, isTruncated },
        { resources: [...topicsPage.topics, ...subscriptionsPage.subscriptions] },
        (resource) => `${resource.resourceType}/${resource.name}`,
      );
      setResources(next.resources);
      setIsTruncated(next.isTruncated);
      setTopicNextPageToken(topicsPage.nextPageToken);
      setSubscriptionNextPageToken(subscriptionsPage.nextPageToken);
    } catch (error) {
      if (requestGeneration !== generation.current) return;
      setLoadMoreError(error instanceof Error ? error : new Error(String(error)));
    } finally {
      if (requestGeneration === generation.current) {
        loadingMore.current = false;
        setIsLoadingMore(false);
      }
    }
  }, [accessToken, hasMore, isTruncated, projectId, resources, subscriptionNextPageToken, topicNextPageToken]);

  const noopLoadMore = useCallback(async () => undefined, []);

  const { isLoading, error, revalidate } = usePromise(
    async (projId: string, token: string) => {
      const requestGeneration = ++generation.current;
      loadingMore.current = false;
      setIsLoadingMore(false);
      setResources([]);
      setTopicNextPageToken(undefined);
      setSubscriptionNextPageToken(undefined);
      setIsTruncated(false);
      setLoadMoreError(undefined);

      const [topicsPage, subscriptionsPage] = await Promise.all([
        listPubSubTopicsPage(projId, token, { pageSize: PUBSUB_PAGE_SIZE }),
        listPubSubSubscriptionsPage(projId, token, { pageSize: PUBSUB_PAGE_SIZE }),
      ]);

      if (requestGeneration !== generation.current) return;
      const initial = appendResourcePage(
        { resources: [], isTruncated: false },
        { resources: [...topicsPage.topics, ...subscriptionsPage.subscriptions] },
        (resource) => `${resource.resourceType}/${resource.name}`,
      );
      setResources(initial.resources);
      setIsTruncated(initial.isTruncated);
      setTopicNextPageToken(topicsPage.nextPageToken);
      setSubscriptionNextPageToken(subscriptionsPage.nextPageToken);
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
    reload: async () => {
      await revalidate();
    },
    error: undefined,
  };
};

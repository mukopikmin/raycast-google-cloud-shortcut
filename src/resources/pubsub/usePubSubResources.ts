import { collectMatchingResourcePage, mergeResourceSearchPages, normalizeSearch } from "../../pagination/search";
import { PageOptions } from "../../pagination/types";
import { appendResourcePage, RESOURCE_PAGE_SIZE } from "../../pagination/pages";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { usePromise } from "@raycast/utils";
import { useGoogleApi } from "../../auth/google";
import { listPubSubSubscriptionsPage, listPubSubTopicsPage } from "./api";
import { PubSubResource } from "./types";

// Both streams must fit in the retained window before either token advances.
const PUBSUB_PAGE_SIZE = RESOURCE_PAGE_SIZE / 2;
const getName = (resource: PubSubResource) => resource.name;
const getResourceId = (resource: PubSubResource) => `${resource.resourceType}/${resource.name}`;
const getSearchText = (resource: PubSubResource) => resource.keywords.join(" ");

const searchPubSubPage = (
  projectId: string,
  accessToken: string,
  options: PageOptions,
  query: string,
  subscriptions: boolean,
  isCurrent: () => boolean,
  onPageChecked: () => void,
) =>
  collectMatchingResourcePage<PubSubResource>(
    async (options) => {
      if (subscriptions) {
        const page = await listPubSubSubscriptionsPage(projectId, accessToken, options);
        return { resources: page.subscriptions, nextPageToken: page.nextPageToken };
      }
      const page = await listPubSubTopicsPage(projectId, accessToken, options);
      return { resources: page.topics, nextPageToken: page.nextPageToken };
    },
    options,
    query,
    getResourceId,
    getSearchText,
    isCurrent,
    onPageChecked,
    getName,
  );

type SuccessResult = {
  resources: PubSubResource[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  isTruncated: boolean;
  loadMore: () => Promise<void>;
  isSearching: boolean;
  pagesSearched: number;
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
  isSearching: boolean;
  pagesSearched: number;
  error: undefined;
};

type ErrorResult = {
  resources: undefined;
  isLoading: false;
  isLoadingMore: false;
  hasMore: false;
  isTruncated: false;
  loadMore: () => Promise<void>;
  isSearching: boolean;
  pagesSearched: number;
  error: Error;
};

type UsePubSubResourcesResult = SuccessResult | LoadingResult | ErrorResult;

export const usePubSubResources = (projectId: string, searchText = ""): UsePubSubResourcesResult => {
  const { accessToken } = useGoogleApi();

  const [resources, setResources] = useState<PubSubResource[]>([]);
  const [topicNextPageToken, setTopicNextPageToken] = useState<string | undefined>();
  const [subscriptionNextPageToken, setSubscriptionNextPageToken] = useState<string | undefined>();
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState<Error | undefined>();
  const loadingMore = useRef(false);
  const generation = useRef(0);
  const query = normalizeSearch(searchText);
  const activeQuery = useRef(query);
  const [pagesSearched, setPagesSearched] = useState(0);
  const activeProject = useRef({ projectId, accessToken });
  useEffect(
    () => () => {
      generation.current += 1;
    },
    [],
  );

  const hasMore = useMemo(
    () => Boolean(topicNextPageToken) || Boolean(subscriptionNextPageToken),
    [subscriptionNextPageToken, topicNextPageToken],
  );

  const loadMore = useCallback(async () => {
    if (
      !hasMore ||
      loadingMore.current ||
      activeQuery.current !== query ||
      activeProject.current.projectId !== projectId ||
      activeProject.current.accessToken !== accessToken
    ) {
      return;
    }

    const requestGeneration = generation.current;
    loadingMore.current = true;
    setIsLoadingMore(true);
    setLoadMoreError(undefined);
    setPagesSearched(0);

    try {
      const isCurrent = () => requestGeneration === generation.current;
      const onPageChecked = () => {
        if (query) setPagesSearched((count) => count + 1);
      };
      const [topicsPage, subscriptionsPage] = await Promise.all([
        topicNextPageToken
          ? searchPubSubPage(
              projectId,
              accessToken,
              { pageSize: PUBSUB_PAGE_SIZE, pageToken: topicNextPageToken },
              query,
              false,
              isCurrent,
              onPageChecked,
            )
          : Promise.resolve({ resources: [], nextPageToken: undefined }),
        subscriptionNextPageToken
          ? searchPubSubPage(
              projectId,
              accessToken,
              { pageSize: PUBSUB_PAGE_SIZE, pageToken: subscriptionNextPageToken },
              query,
              true,
              isCurrent,
              onPageChecked,
            )
          : Promise.resolve({ resources: [], nextPageToken: undefined }),
      ]);

      if (requestGeneration !== generation.current) return;
      const next = appendResourcePage(
        { resources, isTruncated },
        { resources: [...topicsPage.resources, ...subscriptionsPage.resources] },
        getResourceId,
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
  }, [accessToken, hasMore, isTruncated, projectId, query, resources, subscriptionNextPageToken, topicNextPageToken]);

  const noopLoadMore = useCallback(async () => undefined, []);

  const { isLoading, error, revalidate } = usePromise(
    async (projId: string, token: string, search: string) => {
      const requestGeneration = ++generation.current;
      activeQuery.current = search;
      activeProject.current = { projectId: projId, accessToken: token };
      setPagesSearched(0);
      loadingMore.current = false;
      setIsLoadingMore(false);
      setResources([]);
      setTopicNextPageToken(undefined);
      setSubscriptionNextPageToken(undefined);
      setIsTruncated(false);
      setLoadMoreError(undefined);

      const isCurrent = () => requestGeneration === generation.current;
      const onPageChecked = () => {
        if (search) setPagesSearched((count) => count + 1);
      };
      const [topicsPage, subscriptionsPage] = await Promise.all([
        searchPubSubPage(projId, token, { pageSize: PUBSUB_PAGE_SIZE }, search, false, isCurrent, onPageChecked),
        searchPubSubPage(projId, token, { pageSize: PUBSUB_PAGE_SIZE }, search, true, isCurrent, onPageChecked),
      ]);

      if (requestGeneration !== generation.current) return;
      const initial = search
        ? mergeResourceSearchPages([topicsPage, subscriptionsPage], search, getResourceId, getSearchText, getName)
        : appendResourcePage(
            { resources: [], isTruncated: false },
            { resources: [...topicsPage.resources, ...subscriptionsPage.resources] },
            getResourceId,
          );
      setResources(initial.resources);
      setIsTruncated(initial.isTruncated);
      setTopicNextPageToken(topicsPage.nextPageToken);
      setSubscriptionNextPageToken(subscriptionsPage.nextPageToken);
    },
    [projectId, accessToken, query],
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
      isSearching: Boolean(query) && isLoading,
      pagesSearched,
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
      isSearching: Boolean(query) && isLoading,
      pagesSearched,
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
    isSearching: Boolean(query) && (isLoading || isLoadingMore),
    pagesSearched,
    reload: async () => {
      await revalidate();
    },
    error: undefined,
  };
};

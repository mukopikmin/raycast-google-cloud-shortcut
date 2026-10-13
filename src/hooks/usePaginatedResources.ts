import { useCallback, useEffect, useRef, useState } from "react";
import { usePromise } from "@raycast/utils";
import { appendResourcePage, emptyResourcePageState, RESOURCE_PAGE_SIZE } from "../pagination/pages";
import { PageOptions, ResourcePage } from "../pagination/types";
import { collectMatchingResourcePage, normalizeSearch } from "../pagination/search";

export const usePaginatedResources = <T>(
  fetchPage: (options: PageOptions) => Promise<ResourcePage<T>>,
  getId: (resource: T) => string,
  getSearchText: (resource: T) => string,
  searchText = "",
  getName: (resource: T) => string = getSearchText,
) => {
  const [state, setState] = useState(emptyResourcePageState<T>);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState<Error>();
  const loadingMore = useRef(false);
  const generation = useRef(0);
  const [pagesSearched, setPagesSearched] = useState(0);
  const [resourcesSearched, setResourcesSearched] = useState(0);
  const query = normalizeSearch(searchText);
  const activeQuery = useRef(query);
  const activeFetch = useRef(fetchPage);
  useEffect(
    () => () => {
      generation.current += 1;
    },
    [],
  );

  const { isLoading, error, revalidate } = usePromise(
    async (fetch: typeof fetchPage, search: string) => {
      const requestGeneration = ++generation.current;
      activeQuery.current = search;
      activeFetch.current = fetch;
      loadingMore.current = false;
      setIsLoadingMore(false);
      setState(emptyResourcePageState<T>());
      setLoadMoreError(undefined);
      setPagesSearched(0);
      setResourcesSearched(0);
      return collectMatchingResourcePage(
        fetch,
        { pageSize: RESOURCE_PAGE_SIZE },
        search,
        getId,
        getSearchText,
        () => requestGeneration === generation.current,
        (page) => {
          if (search) {
            setPagesSearched((count) => count + 1);
            setResourcesSearched((count) => count + page.resources.length);
          }
        },
        getName,
      );
    },
    [fetchPage, query],
    { onData: (page) => setState(appendResourcePage(emptyResourcePageState<T>(), page, getId)) },
  );

  const loadMore = useCallback(async () => {
    if (
      !state.nextPageToken ||
      loadingMore.current ||
      isLoading ||
      activeQuery.current !== query ||
      activeFetch.current !== fetchPage
    ) {
      return;
    }
    const requestGeneration = generation.current;
    loadingMore.current = true;
    setIsLoadingMore(true);
    setLoadMoreError(undefined);
    setPagesSearched(0);
    setResourcesSearched(0);
    try {
      const page = await collectMatchingResourcePage(
        fetchPage,
        { pageSize: RESOURCE_PAGE_SIZE, pageToken: state.nextPageToken },
        query,
        getId,
        getSearchText,
        () => requestGeneration === generation.current,
        (page) => {
          if (query) {
            setPagesSearched((count) => count + 1);
            setResourcesSearched((count) => count + page.resources.length);
          }
        },
        getName,
      );
      if (requestGeneration === generation.current) {
        setState((current) => appendResourcePage(current, page, getId));
      }
    } catch (error) {
      if (requestGeneration === generation.current) {
        setLoadMoreError(error instanceof Error ? error : new Error(String(error)));
      }
    } finally {
      if (requestGeneration === generation.current) {
        loadingMore.current = false;
        setIsLoadingMore(false);
      }
    }
  }, [fetchPage, getId, getSearchText, getName, query, isLoading, state.nextPageToken]);

  const awaitingRequest = activeQuery.current !== query || activeFetch.current !== fetchPage;
  const visibleState = awaitingRequest ? emptyResourcePageState<T>() : state;
  return {
    ...visibleState,
    isLoading: isLoading || awaitingRequest,
    isLoadingMore,
    isSearching: Boolean(query) && (isLoading || isLoadingMore || awaitingRequest),
    pagesSearched,
    resourcesSearched,
    hasMore: Boolean(visibleState.nextPageToken),
    loadMore,
    reload: async () => {
      await revalidate();
    },
    error: error || loadMoreError,
  };
};

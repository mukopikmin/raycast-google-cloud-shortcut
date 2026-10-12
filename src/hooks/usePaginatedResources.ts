import { useCallback, useRef, useState } from "react";
import { usePromise } from "@raycast/utils";
import { appendResourcePage, emptyResourcePageState, RESOURCE_PAGE_SIZE } from "../pagination/pages";
import { PageOptions, ResourcePage } from "../pagination/types";

export const usePaginatedResources = <T>(
  fetchPage: (options: PageOptions) => Promise<ResourcePage<T>>,
  getId: (resource: T) => string,
) => {
  const [state, setState] = useState(emptyResourcePageState<T>);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState<Error>();
  const loadingMore = useRef(false);
  const generation = useRef(0);

  const { isLoading, error, revalidate } = usePromise(
    async (fetch: typeof fetchPage) => {
      generation.current += 1;
      loadingMore.current = false;
      setIsLoadingMore(false);
      setState(emptyResourcePageState<T>());
      setLoadMoreError(undefined);
      return fetch({ pageSize: RESOURCE_PAGE_SIZE });
    },
    [fetchPage],
    { onData: (page) => setState(appendResourcePage(emptyResourcePageState<T>(), page, getId)) },
  );

  const loadMore = useCallback(async () => {
    if (!state.nextPageToken || loadingMore.current || isLoading) {
      return;
    }
    const requestGeneration = generation.current;
    loadingMore.current = true;
    setIsLoadingMore(true);
    setLoadMoreError(undefined);
    try {
      const page = await fetchPage({ pageSize: RESOURCE_PAGE_SIZE, pageToken: state.nextPageToken });
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
  }, [fetchPage, getId, isLoading, state.nextPageToken]);

  return {
    ...state,
    isLoading,
    isLoadingMore,
    hasMore: Boolean(state.nextPageToken),
    loadMore,
    reload: async () => {
      await revalidate();
    },
    error: error || loadMoreError,
  };
};

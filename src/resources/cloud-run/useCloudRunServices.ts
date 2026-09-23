import { useCallback, useRef, useState } from "react";
import { usePromise } from "@raycast/utils";
import { useGoogleApi } from "../../auth/google";
import { listCloudRunServicesPage } from "./api";
import { appendCloudRunServicesPage, emptyCloudRunServicesState } from "./pagination";

const CLOUD_RUN_SERVICE_PAGE_SIZE = 50;

export const useCloudRunServices = (projectId: string) => {
  const { accessToken } = useGoogleApi();
  const [state, setState] = useState(emptyCloudRunServicesState);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState<Error | undefined>();
  const loadingMore = useRef(false);
  const generation = useRef(0);

  const { isLoading, error } = usePromise(
    async (projId: string, token: string) => {
      generation.current += 1;
      loadingMore.current = false;
      setIsLoadingMore(false);
      setState(emptyCloudRunServicesState());
      setLoadMoreError(undefined);
      return listCloudRunServicesPage(projId, token, { pageSize: CLOUD_RUN_SERVICE_PAGE_SIZE });
    },
    [projectId, accessToken],
    {
      onData: (page) => setState(appendCloudRunServicesPage(emptyCloudRunServicesState(), page)),
    },
  );

  const loadMore = useCallback(async () => {
    if (!state.nextPageToken || loadingMore.current || isLoading || state.isTruncated) {
      return;
    }
    const requestGeneration = generation.current;
    loadingMore.current = true;
    setIsLoadingMore(true);
    setLoadMoreError(undefined);
    try {
      const page = await listCloudRunServicesPage(projectId, accessToken, {
        pageSize: CLOUD_RUN_SERVICE_PAGE_SIZE,
        pageToken: state.nextPageToken,
      });
      if (requestGeneration === generation.current) {
        setState((current) => appendCloudRunServicesPage(current, page));
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
  }, [accessToken, isLoading, projectId, state.nextPageToken, state.isTruncated]);

  return {
    services: state.services,
    nextPageToken: state.nextPageToken,
    unreachable: state.unreachable,
    isLoading,
    isLoadingMore,
    hasMore: Boolean(state.nextPageToken),
    isTruncated: state.isTruncated,
    loadMore,
    error: error || loadMoreError,
  };
};

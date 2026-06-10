import { useCallback, useState } from "react";
import { usePromise } from "@raycast/utils";
import { useGoogleApi } from "../auth/google";
import { listSecretManagerSecretsPage } from "./api";
import { SecretManagerSecret } from "./types";

const SECRET_MANAGER_PAGE_SIZE = 50;
const SECRET_MANAGER_LIMIT = 500;

type SuccessResult = {
  secrets: SecretManagerSecret[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  isTruncated: boolean;
  loadMore: () => Promise<void>;
  error: undefined;
};

type LoadingResult = {
  secrets: undefined;
  isLoading: true;
  isLoadingMore: false;
  hasMore: false;
  isTruncated: false;
  loadMore: () => Promise<void>;
  error: undefined;
};

type ErrorResult = {
  secrets: undefined;
  isLoading: false;
  isLoadingMore: false;
  hasMore: false;
  isTruncated: false;
  loadMore: () => Promise<void>;
  error: Error;
};

type UseSecretManagerResult = SuccessResult | LoadingResult | ErrorResult;

export const useSecretManager = (projectId: string): UseSecretManagerResult => {
  const { accessToken } = useGoogleApi();
  const [secrets, setSecrets] = useState<SecretManagerSecret[]>([]);
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
      const page = await listSecretManagerSecretsPage(projectId, accessToken, {
        pageSize: SECRET_MANAGER_PAGE_SIZE,
        pageToken: nextPageToken,
      });

      const nextSecrets = [...secrets, ...page.secrets];
      if (nextSecrets.length >= SECRET_MANAGER_LIMIT) {
        setSecrets(nextSecrets.slice(0, SECRET_MANAGER_LIMIT));
        setNextPageToken(undefined);
        setIsTruncated(Boolean(page.nextPageToken) || nextSecrets.length > SECRET_MANAGER_LIMIT);
      } else {
        setSecrets(nextSecrets);
        setNextPageToken(page.nextPageToken);
      }
    } catch (error) {
      setLoadMoreError(error instanceof Error ? error : new Error(String(error)));
    } finally {
      setIsLoadingMore(false);
    }
  }, [accessToken, secrets, isLoadingMore, isTruncated, nextPageToken, projectId]);

  const noopLoadMore = useCallback(async () => undefined, []);

  const { isLoading, error } = usePromise(
    async (projId: string, token: string) => {
      setSecrets([]);
      setNextPageToken(undefined);
      setIsTruncated(false);
      setLoadMoreError(undefined);

      const page = await listSecretManagerSecretsPage(projId, token, {
        pageSize: SECRET_MANAGER_PAGE_SIZE,
      });

      setSecrets(page.secrets.slice(0, SECRET_MANAGER_LIMIT));
      setNextPageToken(page.secrets.length >= SECRET_MANAGER_LIMIT ? undefined : page.nextPageToken);
      setIsTruncated(page.secrets.length >= SECRET_MANAGER_LIMIT && Boolean(page.nextPageToken));
    },
    [projectId, accessToken],
  );

  const resultError = error || loadMoreError;

  if (resultError) {
    return {
      secrets: undefined,
      isLoading: false,
      isLoadingMore: false,
      hasMore: false,
      isTruncated: false,
      loadMore: noopLoadMore,
      error: resultError,
    };
  }

  if (isLoading && secrets.length === 0) {
    return {
      secrets: undefined,
      isLoading: true,
      isLoadingMore: false,
      hasMore: false,
      isTruncated: false,
      loadMore: noopLoadMore,
      error: undefined,
    };
  }

  return {
    secrets,
    isLoading,
    isLoadingMore,
    hasMore: Boolean(nextPageToken),
    isTruncated,
    loadMore,
    error: undefined,
  };
};

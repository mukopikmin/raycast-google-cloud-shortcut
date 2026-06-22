import { useCallback, useState } from "react";
import { usePromise } from "@raycast/utils";
import { useGoogleApi } from "../auth/google";
import { listAlertPoliciesPage } from "./api";
import { AlertPolicy } from "./types";

const ALERT_POLICY_PAGE_SIZE = 50;
const ALERT_POLICY_LIMIT = 500;

type UseAlertPoliciesResult = {
  alertPolicies: AlertPolicy[] | undefined;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  isTruncated: boolean;
  loadMore: () => Promise<void>;
  error: Error | undefined;
};

export const useAlertPolicies = (projectId: string): UseAlertPoliciesResult => {
  const { accessToken } = useGoogleApi();
  const [alertPolicies, setAlertPolicies] = useState<AlertPolicy[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>();
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState<Error | undefined>();

  const loadMore = useCallback(async () => {
    if (!nextPageToken || isLoadingMore || isTruncated) return;

    setIsLoadingMore(true);
    setLoadMoreError(undefined);
    try {
      const page = await listAlertPoliciesPage(projectId, accessToken, {
        pageSize: ALERT_POLICY_PAGE_SIZE,
        pageToken: nextPageToken,
      });
      const nextAlertPolicies = [...alertPolicies, ...page.alertPolicies];

      if (nextAlertPolicies.length >= ALERT_POLICY_LIMIT) {
        setAlertPolicies(nextAlertPolicies.slice(0, ALERT_POLICY_LIMIT));
        setNextPageToken(undefined);
        setIsTruncated(Boolean(page.nextPageToken) || nextAlertPolicies.length > ALERT_POLICY_LIMIT);
      } else {
        setAlertPolicies(nextAlertPolicies);
        setNextPageToken(page.nextPageToken);
      }
    } catch (error) {
      setLoadMoreError(error instanceof Error ? error : new Error(String(error)));
    } finally {
      setIsLoadingMore(false);
    }
  }, [accessToken, alertPolicies, isLoadingMore, isTruncated, nextPageToken, projectId]);

  const noopLoadMore = useCallback(async () => undefined, []);

  const { isLoading, error } = usePromise(
    async (projId: string, token: string) => {
      setAlertPolicies([]);
      setNextPageToken(undefined);
      setIsTruncated(false);
      setLoadMoreError(undefined);

      const page = await listAlertPoliciesPage(projId, token, { pageSize: ALERT_POLICY_PAGE_SIZE });
      setAlertPolicies(page.alertPolicies.slice(0, ALERT_POLICY_LIMIT));
      setNextPageToken(page.alertPolicies.length >= ALERT_POLICY_LIMIT ? undefined : page.nextPageToken);
      setIsTruncated(page.alertPolicies.length >= ALERT_POLICY_LIMIT && Boolean(page.nextPageToken));
    },
    [projectId, accessToken],
  );

  const resultError = error || loadMoreError;
  if (resultError) {
    return {
      alertPolicies: undefined,
      isLoading: false,
      isLoadingMore: false,
      hasMore: false,
      isTruncated: false,
      loadMore: noopLoadMore,
      error: resultError,
    };
  }

  if (isLoading && alertPolicies.length === 0) {
    return {
      alertPolicies: undefined,
      isLoading: true,
      isLoadingMore: false,
      hasMore: false,
      isTruncated: false,
      loadMore: noopLoadMore,
      error: undefined,
    };
  }

  return {
    alertPolicies,
    isLoading,
    isLoadingMore,
    hasMore: Boolean(nextPageToken),
    isTruncated,
    loadMore,
    error: undefined,
  };
};

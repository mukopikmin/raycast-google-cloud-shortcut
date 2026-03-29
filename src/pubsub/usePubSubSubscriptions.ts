import { usePromise } from "@raycast/utils";
import { useGoogleApi } from "../auth/google";
import { PubSubSubscription } from "./types";
import { listPubSubSubscriptions } from "./api";

type UsePubSubSubscriptionResult =
  | {
      subscriptions: PubSubSubscription[];
      isLoading: boolean;
      error: undefined;
    }
  | {
      subscriptions: undefined;
      isLoading: true;
      error: undefined;
    }
  | {
      subscriptions: undefined;
      isLoading: false;
      error: Error;
    };

export const usePubSubSubscriptions = (projectId: string): UsePubSubSubscriptionResult => {
  const { accessToken } = useGoogleApi();
  const { data, isLoading, error } = usePromise(
    async (projId: string, token: string) => {
      return await listPubSubSubscriptions(projId, token);
    },
    [projectId, accessToken],
  );

  if (error) {
    return { subscriptions: undefined, isLoading: false, error };
  }

  if (!data) {
    return { subscriptions: undefined, isLoading: true, error: undefined };
  }

  return { subscriptions: data, isLoading, error: undefined };
};

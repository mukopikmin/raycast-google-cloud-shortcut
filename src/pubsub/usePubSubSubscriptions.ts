import { useEffect, useState } from "react";
import { useGoogleApi } from "../auth/google";
import { PubSubSubscription } from "./types";
import { listPubSubSubscriptions } from "./api";

type UsePubSubSubscriptionResult =
  | {
      subscriptions: PubSubSubscription[];
      isLoading: false;
    }
  | {
      subscriptions: undefined;
      isLoading: true;
    };

export const usePubSubSubscriptions = (projectId: string): UsePubSubSubscriptionResult => {
  const { accessToken } = useGoogleApi();
  const [subscriptions, setSubscriptions] = useState<PubSubSubscription[] | undefined>();

  useEffect(() => {
    (async () => {
      const data = await listPubSubSubscriptions(projectId, accessToken);
      setSubscriptions(data);
    })();
  }, [projectId]);

  return subscriptions === undefined
    ? {
        subscriptions: undefined,
        isLoading: true,
      }
    : {
        subscriptions,
        isLoading: false,
      };
};

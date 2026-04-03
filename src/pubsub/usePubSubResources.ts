import { PubSubResource } from "./types";
import { usePubSubSubscriptions } from "./usePubSubSubscriptions";
import { usePubSubTopics } from "./usePubSubTopics";

type UsePubSubResourcesResult =
  | {
      resources: PubSubResource[];
      isLoading: false;
    }
  | {
      resources: undefined;
      isLoading: true;
    };

export const usePubSubResources = (projectId: string): UsePubSubResourcesResult => {
  const { subscriptions, isLoading: isLoadingSubscriptions } = usePubSubSubscriptions(projectId);
  const { topics, isLoading: isLoadingTopics } = usePubSubTopics(projectId);

  return isLoadingSubscriptions || isLoadingTopics
    ? {
        resources: undefined,
        isLoading: true,
      }
    : {
        resources: [...topics, ...subscriptions],
        isLoading: false,
      };
};

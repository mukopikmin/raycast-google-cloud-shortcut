import { PubSubResource } from "./types";
import { usePubSubSubscriptions } from "./usePubSubSubscriptions";
import { usePubSubTopics } from "./usePubSubTopics";

type UsePubSubResourcesResult =
  | {
      resources: PubSubResource[];
      isLoading: boolean;
      error: undefined;
    }
  | {
      resources: undefined;
      isLoading: true;
      error: undefined;
    }
  | {
      resources: undefined;
      isLoading: false;
      error: Error;
    };

export const usePubSubResources = (projectId: string): UsePubSubResourcesResult => {
  const {
    subscriptions,
    isLoading: isLoadingSubscriptions,
    error: errorSubscriptions,
  } = usePubSubSubscriptions(projectId);
  const { topics, isLoading: isLoadingTopics, error: errorTopics } = usePubSubTopics(projectId);

  const error = errorSubscriptions || errorTopics;
  if (error) {
    return {
      resources: undefined,
      isLoading: false,
      error: error,
    };
  }

  if (isLoadingSubscriptions || isLoadingTopics || !subscriptions || !topics) {
    return {
      resources: undefined,
      isLoading: true,
      error: undefined,
    };
  }

  return {
    resources: [...topics, ...subscriptions],
    isLoading: false,
    error: undefined,
  };
};

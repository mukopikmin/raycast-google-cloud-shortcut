import { fetchGoogleApi } from "../auth/api";
import { createPubSubSubscription, createPubSubTopic, PubSubSubscription, PubSubTopic } from "./types";

type PubSubSubscriptionsResponse = {
  subscriptions?: {
    name: string;
    topic: string;
    pushConfig?: {
      pushEndpoint: string;
    };
  }[];
};

/**
 * @see https://docs.cloud.google.com/pubsub/docs/reference/rest/v1/projects.subscriptions/list
 */
export const listPubSubSubscriptions = async (
  projectId: string,
  accessToken: string,
): Promise<PubSubSubscription[]> => {
  const body = await fetchGoogleApi<PubSubSubscriptionsResponse>(
    `https://pubsub.googleapis.com/v1/projects/${projectId}/subscriptions`,
    accessToken,
  );

  return (
    body.subscriptions?.map((subscription) => {
      return createPubSubSubscription({
        projectId,
        // projects/PROJECT_ID/subscriptions/SUBSCRIPTION_ID
        name: subscription.name.split("/")[3] ?? "",
        // projects/PROJECT_ID/topics/TOPIC_ID
        topic: subscription.topic.split("/")[3] ?? "",
        subscriptionType: subscription.pushConfig === undefined ? "Pull" : "Push",
      });
    }) ?? []
  );
};

type PubSubTopicsResponse = {
  topics?: {
    name: string;
  }[];
};

/**
 * @see https://cloud.google.com/pubsub/docs/reference/rest/v1/projects.topics/list
 */
export const listPubSubTopics = async (projectId: string, accessToken: string): Promise<PubSubTopic[]> => {
  const body = await fetchGoogleApi<PubSubTopicsResponse>(
    `https://pubsub.googleapis.com/v1/projects/${projectId}/topics`,
    accessToken,
  );

  return (
    body.topics?.map((topic) => {
      return createPubSubTopic({
        projectId,
        // projects/PROJECT_ID/topics/TOPIC_ID
        name: topic.name.split("/")[3] ?? "",
      });
    }) ?? []
  );
};

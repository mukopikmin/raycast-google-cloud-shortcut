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
  nextPageToken?: string;
};

/**
 * @see https://docs.cloud.google.com/pubsub/docs/reference/rest/v1/projects.subscriptions/list
 */
export const listPubSubSubscriptions = async (
  projectId: string,
  accessToken: string,
): Promise<PubSubSubscription[]> => {
  const subscriptions: PubSubSubscription[] = [];
  let pageToken: string | undefined;

  do {
    const query = new URLSearchParams();
    if (pageToken) {
      query.set("pageToken", pageToken);
    }
    const suffix = query.toString();

    const body = await fetchGoogleApi<PubSubSubscriptionsResponse>(
      `https://pubsub.googleapis.com/v1/projects/${projectId}/subscriptions${suffix ? `?${suffix}` : ""}`,
      accessToken,
    );

    subscriptions.push(
      ...(body.subscriptions?.map((subscription) => {
        return createPubSubSubscription({
          projectId,
          // projects/PROJECT_ID/subscriptions/SUBSCRIPTION_ID
          name: subscription.name.split("/")[3] ?? "",
          // projects/PROJECT_ID/topics/TOPIC_ID
          topic: subscription.topic.split("/")[3] ?? "",
          subscriptionType: subscription.pushConfig === undefined ? "Pull" : "Push",
        });
      }) ?? []),
    );

    pageToken = body.nextPageToken;
  } while (pageToken);

  return subscriptions;
};

type PubSubTopicsResponse = {
  topics?: {
    name: string;
  }[];
  nextPageToken?: string;
};

/**
 * @see https://cloud.google.com/pubsub/docs/reference/rest/v1/projects.topics/list
 */
export const listPubSubTopics = async (projectId: string, accessToken: string): Promise<PubSubTopic[]> => {
  const topics: PubSubTopic[] = [];
  let pageToken: string | undefined;

  do {
    const query = new URLSearchParams();
    if (pageToken) {
      query.set("pageToken", pageToken);
    }
    const suffix = query.toString();

    const body = await fetchGoogleApi<PubSubTopicsResponse>(
      `https://pubsub.googleapis.com/v1/projects/${projectId}/topics${suffix ? `?${suffix}` : ""}`,
      accessToken,
    );

    topics.push(
      ...(body.topics?.map((topic) => {
        return createPubSubTopic({
          projectId,
          // projects/PROJECT_ID/topics/TOPIC_ID
          name: topic.name.split("/")[3] ?? "",
        });
      }) ?? []),
    );

    pageToken = body.nextPageToken;
  } while (pageToken);

  return topics;
};

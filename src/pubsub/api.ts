import { fetchGoogleApi } from "../auth/api";
import { createPubSubSubscription, createPubSubTopic, PubSubSubscription, PubSubTopic } from "./types";

type PubSubSubscriptionsResponse = {
  nextPageToken?: string;
  subscriptions?: {
    name: string;
    topic: string;
    pushConfig?: {
      pushEndpoint: string;
    };
  }[];
};

type ListPubSubSubscriptionsPageOptions = {
  pageSize: number;
  pageToken?: string;
};

export type PubSubSubscriptionsPage = {
  subscriptions: PubSubSubscription[];
  nextPageToken?: string;
};

/**
 * @see https://docs.cloud.google.com/pubsub/docs/reference/rest/v1/projects.subscriptions/list
 */
export const listPubSubSubscriptionsPage = async (
  projectId: string,
  accessToken: string,
  options: ListPubSubSubscriptionsPageOptions,
): Promise<PubSubSubscriptionsPage> => {
  const apiUrl = new URL(`https://pubsub.googleapis.com/v1/projects/${projectId}/subscriptions`);
  apiUrl.searchParams.append("pageSize", String(options.pageSize));
  if (options.pageToken) {
    apiUrl.searchParams.append("pageToken", options.pageToken);
  }

  const body = await fetchGoogleApi<PubSubSubscriptionsResponse>(apiUrl.toString(), accessToken);

  return {
    subscriptions:
      body.subscriptions?.map((subscription) => {
        return createPubSubSubscription({
          projectId,
          // projects/PROJECT_ID/subscriptions/SUBSCRIPTION_ID
          name: subscription.name.split("/")[3] ?? "",
          // projects/PROJECT_ID/topics/TOPIC_ID
          topic: subscription.topic.split("/")[3] ?? "",
          subscriptionType: subscription.pushConfig === undefined ? "Pull" : "Push",
        });
      }) ?? [],
    nextPageToken: body.nextPageToken,
  };
};

type PubSubTopicsResponse = {
  nextPageToken?: string;
  topics?: {
    name: string;
  }[];
};

type ListPubSubTopicsPageOptions = {
  pageSize: number;
  pageToken?: string;
};

export type PubSubTopicsPage = {
  topics: PubSubTopic[];
  nextPageToken?: string;
};

/**
 * @see https://cloud.google.com/pubsub/docs/reference/rest/v1/projects.topics/list
 */
export const listPubSubTopicsPage = async (
  projectId: string,
  accessToken: string,
  options: ListPubSubTopicsPageOptions,
): Promise<PubSubTopicsPage> => {
  const apiUrl = new URL(`https://pubsub.googleapis.com/v1/projects/${projectId}/topics`);
  apiUrl.searchParams.append("pageSize", String(options.pageSize));
  if (options.pageToken) {
    apiUrl.searchParams.append("pageToken", options.pageToken);
  }

  const body = await fetchGoogleApi<PubSubTopicsResponse>(apiUrl.toString(), accessToken);

  return {
    topics:
      body.topics?.map((topic) => {
        return createPubSubTopic({
          projectId,
          // projects/PROJECT_ID/topics/TOPIC_ID
          name: topic.name.split("/")[3] ?? "",
        });
      }) ?? [],
    nextPageToken: body.nextPageToken,
  };
};

export const listPubSubSubscriptions = async (
  projectId: string,
  accessToken: string,
): Promise<PubSubSubscription[]> => {
  const page = await listPubSubSubscriptionsPage(projectId, accessToken, { pageSize: 1000 });
  return page.subscriptions;
};

export const listPubSubTopics = async (projectId: string, accessToken: string): Promise<PubSubTopic[]> => {
  const page = await listPubSubTopicsPage(projectId, accessToken, { pageSize: 1000 });
  return page.topics;
};

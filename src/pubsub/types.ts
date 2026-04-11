export type PubSubResource = PubSubSubscription | PubSubTopic;

export type PubSubResourceType = "Subscription" | "Topic";

export type PubSubSubscription = {
  resourceType: "Subscription";
  name: string;
  topic: string;
  subscriptionType: "Push" | "Pull";
  url: string;
  keywords: string[];
};

export const createPubSubSubscription = (
  args: Omit<PubSubSubscription, "url" | "keywords" | "resourceType"> & { projectId: string },
): PubSubSubscription => {
  return {
    resourceType: "Subscription",
    name: args.name,
    topic: args.topic,
    subscriptionType: args.subscriptionType,
    url: `https://console.cloud.google.com/cloudpubsub/subscription/detail/${args.name}?project=${args.projectId}`,
    keywords: [args.name, args.topic, args.subscriptionType, "Subscription"],
  };
};

export type PubSubTopic = {
  resourceType: "Topic";
  name: string;
  url: string;
  keywords: string[];
};

export const createPubSubTopic = (
  args: Omit<PubSubTopic, "url" | "keywords" | "resourceType"> & { projectId: string },
): PubSubTopic => {
  return {
    resourceType: "Topic",
    name: args.name,
    url: `https://console.cloud.google.com/cloudpubsub/topic/detail/${args.name}?project=${args.projectId}`,
    keywords: [args.name, "Topic"],
  };
};

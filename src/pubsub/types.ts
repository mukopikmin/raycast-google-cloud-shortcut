export type PubSubSubscription = {
    name: string;
    topic: string;
    subscriptionType: "Push" | "Pull";
    url: string;
    keywords: string[];
};

export const createPubSubSubscription = (
    args: Omit<PubSubSubscription, "url" | "keywords"> & { projectId: string },
): PubSubSubscription => {
    return {
        name: args.name,
        topic: args.topic,
        subscriptionType: args.subscriptionType,
        url: `https://console.cloud.google.com/pubsub/subscription/${args.name}?project=${args.projectId}`,
        keywords: [
            args.name,
            args.topic,
            args.subscriptionType,
        ],
    };
};

import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchGoogleApi } from "../auth/api";
import { listPubSubSubscriptionsPage, listPubSubTopicsPage } from "./api";

vi.mock("../auth/api", () => ({
  fetchGoogleApi: vi.fn(),
}));

const fetchGoogleApiMock = vi.mocked(fetchGoogleApi);

describe("Pub/Sub API", () => {
  beforeEach(() => {
    fetchGoogleApiMock.mockReset();
  });

  it("lists a page of topics", async () => {
    fetchGoogleApiMock.mockResolvedValueOnce({
      nextPageToken: "next-topic-page",
      topics: [{ name: "projects/sample-project/topics/orders" }],
    });

    const page = await listPubSubTopicsPage("sample-project", "access-token", {
      pageSize: 50,
      pageToken: "topic-page",
    });

    expect(fetchGoogleApiMock).toHaveBeenCalledWith(
      "https://pubsub.googleapis.com/v1/projects/sample-project/topics?pageSize=50&pageToken=topic-page",
      "access-token",
    );
    expect(page).toEqual({
      nextPageToken: "next-topic-page",
      topics: [
        {
          resourceType: "Topic",
          name: "orders",
          url: "https://console.cloud.google.com/cloudpubsub/topic/detail/orders?project=sample-project",
          keywords: ["orders", "Topic"],
        },
      ],
    });
  });

  it("lists a page of subscriptions", async () => {
    fetchGoogleApiMock.mockResolvedValueOnce({
      nextPageToken: "next-subscription-page",
      subscriptions: [
        {
          name: "projects/sample-project/subscriptions/order-worker",
          topic: "projects/sample-project/topics/orders",
        },
        {
          name: "projects/sample-project/subscriptions/order-webhook",
          topic: "projects/sample-project/topics/orders",
          pushConfig: {
            pushEndpoint: "https://example.com/pubsub",
          },
        },
      ],
    });

    const page = await listPubSubSubscriptionsPage("sample-project", "access-token", {
      pageSize: 50,
      pageToken: "subscription-page",
    });

    expect(fetchGoogleApiMock).toHaveBeenCalledWith(
      "https://pubsub.googleapis.com/v1/projects/sample-project/subscriptions?pageSize=50&pageToken=subscription-page",
      "access-token",
    );
    expect(page).toEqual({
      nextPageToken: "next-subscription-page",
      subscriptions: [
        {
          resourceType: "Subscription",
          name: "order-worker",
          topic: "orders",
          subscriptionType: "Pull",
          url: "https://console.cloud.google.com/cloudpubsub/subscription/detail/order-worker?project=sample-project",
          keywords: ["order-worker", "orders", "Pull", "Subscription"],
        },
        {
          resourceType: "Subscription",
          name: "order-webhook",
          topic: "orders",
          subscriptionType: "Push",
          url: "https://console.cloud.google.com/cloudpubsub/subscription/detail/order-webhook?project=sample-project",
          keywords: ["order-webhook", "orders", "Push", "Subscription"],
        },
      ],
    });
  });

  it("returns empty pages when resources are absent", async () => {
    fetchGoogleApiMock.mockResolvedValueOnce({});
    fetchGoogleApiMock.mockResolvedValueOnce({});

    await expect(listPubSubTopicsPage("sample-project", "access-token", { pageSize: 50 })).resolves.toEqual({
      topics: [],
      nextPageToken: undefined,
    });
    await expect(listPubSubSubscriptionsPage("sample-project", "access-token", { pageSize: 50 })).resolves.toEqual({
      subscriptions: [],
      nextPageToken: undefined,
    });
  });
});

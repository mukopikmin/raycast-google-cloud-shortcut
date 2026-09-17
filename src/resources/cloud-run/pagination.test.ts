import { describe, expect, it } from "vitest";
import { appendCloudRunServicesPage, emptyCloudRunServicesState } from "./pagination";
import { createCloudRunDeployment } from "./types";

const service = (id: number, region = "us-central1") =>
  createCloudRunDeployment({
    id: String(id),
    name: "same-name",
    region,
    projectId: "project",
    deployType: "Container Services",
    url: "https://example.com",
  });

describe("Cloud Run global service pagination", () => {
  it("accumulates partial results and unavailable regions across pages", () => {
    const first = appendCloudRunServicesPage(emptyCloudRunServicesState(), {
      deployments: [service(1)],
      nextPageToken: "next",
      unreachable: ["me-central2"],
    });
    const second = appendCloudRunServicesPage(first, {
      deployments: [service(2, "europe-west1")],
      unreachable: ["me-central2", "asia-east1"],
    });
    expect(second.services.map(({ id }) => id)).toEqual(["1", "2"]);
    expect(second.unreachable).toEqual(["asia-east1", "me-central2"]);
    expect(second.nextPageToken).toBeUndefined();
    expect(second.isTruncated).toBe(false);
  });

  it("deduplicates overlapping pages by UID while keeping same-name services in different regions", () => {
    const first = appendCloudRunServicesPage(emptyCloudRunServicesState(), {
      deployments: [service(1), service(2, "europe-west1")],
      unreachable: [],
      nextPageToken: "next",
    });
    const second = appendCloudRunServicesPage(first, {
      deployments: [{ ...service(1), uri: "https://new.example.com" }, service(3)],
      unreachable: [],
    });
    expect(second.services.map(({ id }) => id)).toEqual(["1", "2", "3"]);
    expect(second.services[0].uri).toBe("https://new.example.com");
  });

  it.each([undefined, "more"])("caps retained services and marks actual truncation (next: %s)", (nextPageToken) => {
    const state = appendCloudRunServicesPage(emptyCloudRunServicesState(), {
      deployments: Array.from({ length: 500 }, (_, i) => service(i)),
      unreachable: [],
      nextPageToken,
    });
    expect(state.services).toHaveLength(500);
    expect(state.nextPageToken).toBeUndefined();
    expect(state.isTruncated).toBe(Boolean(nextPageToken));
  });

  it("marks overflow even when there is no continuation token", () => {
    const first = appendCloudRunServicesPage(emptyCloudRunServicesState(), {
      deployments: Array.from({ length: 490 }, (_, i) => service(i)),
      unreachable: [],
      nextPageToken: "next",
    });
    const last = appendCloudRunServicesPage(first, {
      deployments: Array.from({ length: 20 }, (_, i) => service(490 + i)),
      unreachable: [],
    });
    expect(last.services).toHaveLength(500);
    expect(last.isTruncated).toBe(true);
    expect(last.nextPageToken).toBeUndefined();
  });

  it("keeps an empty partial page pageable and resets warnings for a fresh list", () => {
    const state = appendCloudRunServicesPage(emptyCloudRunServicesState(), {
      deployments: [],
      nextPageToken: "next",
      unreachable: ["me-central2"],
    });
    expect(state.nextPageToken).toBe("next");
    expect(state.unreachable).toEqual(["me-central2"]);
    expect(emptyCloudRunServicesState().unreachable).toEqual([]);
  });
});

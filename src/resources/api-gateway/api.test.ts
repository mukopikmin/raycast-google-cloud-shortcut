import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchGoogleApi } from "../../auth/api";
import { listApiGatewaysPage } from "./api";

vi.mock("../../auth/api", () => ({ fetchGoogleApi: vi.fn() }));
const fetchGoogleApiMock = vi.mocked(fetchGoogleApi);

describe("API Gateway API", () => {
  beforeEach(() => fetchGoogleApiMock.mockReset());

  it("lists gateways across regions and preserves continuation tokens and resource identities", async () => {
    fetchGoogleApiMock.mockResolvedValueOnce({
      gateways: ["us-central1", "asia-northeast1"].map((region) => ({
        name: `projects/sample-project/locations/${region}/gateways/orders`,
        displayName: "Orders API",
        state: "ACTIVE",
        defaultHostname: `orders.${region}.gateway.dev`,
      })),
      nextPageToken: "next-page",
    });

    const page = await listApiGatewaysPage("sample-project", "access-token", {
      pageSize: 50,
      pageToken: "token/+ =",
    });

    expect(fetchGoogleApiMock).toHaveBeenCalledExactlyOnceWith(
      "https://apigateway.googleapis.com/v1/projects/sample-project/locations/-/gateways?pageSize=50&pageToken=token%2F%2B+%3D",
      "access-token",
    );
    expect(page.nextPageToken).toBe("next-page");
    expect(page.resources).toEqual(
      ["us-central1", "asia-northeast1"].map((region) => ({
        id: `projects/sample-project/locations/${region}/gateways/orders`,
        name: "orders",
        displayName: "Orders API",
        region,
        state: "ACTIVE",
        defaultHostname: `orders.${region}.gateway.dev`,
        url: `https://console.cloud.google.com/api-gateway/gateway/${region}/orders?project=sample-project`,
      })),
    );
  });

  it("handles an empty response without requesting additional pages", async () => {
    fetchGoogleApiMock.mockResolvedValueOnce({});
    await expect(listApiGatewaysPage("sample-project", "access-token", { pageSize: 50 })).resolves.toEqual({
      resources: [],
      nextPageToken: undefined,
    });
    expect(fetchGoogleApiMock).toHaveBeenCalledTimes(1);
  });

  it("propagates API errors for the shared error screen", async () => {
    const error = new Error("Forbidden");
    fetchGoogleApiMock.mockRejectedValueOnce(error);
    await expect(listApiGatewaysPage("sample-project", "access-token", { pageSize: 50 })).rejects.toBe(error);
  });
});

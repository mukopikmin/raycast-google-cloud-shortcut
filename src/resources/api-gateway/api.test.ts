import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchGoogleApi } from "../../auth/api";
import { listApiGatewaysPage } from "./api";

vi.mock("../../auth/api", () => ({ fetchGoogleApi: vi.fn() }));
const fetchGoogleApiMock = vi.mocked(fetchGoogleApi);

describe("API Gateway API", () => {
  beforeEach(() => fetchGoogleApiMock.mockReset());

  it("fetches one page across regions and preserves continuation and unavailable regions", async () => {
    fetchGoogleApiMock.mockResolvedValueOnce({
      gateways: [
        {
          name: "projects/sample/locations/us-central1/gateways/orders",
          displayName: "Orders API",
          state: "ACTIVE",
          defaultHostname: "orders.example.gateway.dev",
          apiConfig: "projects/sample/locations/global/apis/orders/configs/v1",
        },
        { name: "projects/sample/locations/europe-west1/gateways/orders" },
      ],
      nextPageToken: "next",
      unreachableLocations: ["asia-northeast1"],
    });

    const page = await listApiGatewaysPage("sample", "token", { pageSize: 50, pageToken: "page+2" });

    expect(fetchGoogleApiMock).toHaveBeenCalledExactlyOnceWith(
      "https://apigateway.googleapis.com/v1/projects/sample/locations/-/gateways?pageSize=50&pageToken=page%2B2",
      "token",
    );
    expect(page.nextPageToken).toBe("next");
    expect(page.unreachable).toEqual(["asia-northeast1"]);
    expect(page.resources[0]).toEqual({
      id: "projects/sample/locations/us-central1/gateways/orders",
      name: "orders",
      displayName: "Orders API",
      region: "us-central1",
      state: "ACTIVE",
      defaultHostname: "orders.example.gateway.dev",
      apiConfig: "projects/sample/locations/global/apis/orders/configs/v1",
      url: "https://console.cloud.google.com/api-gateway/gateway/us-central1/orders?project=sample",
    });
    expect(page.resources[1].id).not.toBe(page.resources[0].id);
    expect(page.resources[1].region).toBe("europe-west1");
  });

  it("handles an empty response without requesting more pages", async () => {
    fetchGoogleApiMock.mockResolvedValueOnce({});
    const page = await listApiGatewaysPage("sample", "token", { pageSize: 50 });
    expect(page.resources).toEqual([]);
    expect(page.nextPageToken).toBeUndefined();
    expect(fetchGoogleApiMock).toHaveBeenCalledExactlyOnceWith(
      "https://apigateway.googleapis.com/v1/projects/sample/locations/-/gateways?pageSize=50",
      "token",
    );
  });

  it("propagates API failures for the error screen", async () => {
    const error = new Error("Permission denied");
    fetchGoogleApiMock.mockRejectedValueOnce(error);
    await expect(listApiGatewaysPage("sample", "token", { pageSize: 50 })).rejects.toBe(error);
  });
});

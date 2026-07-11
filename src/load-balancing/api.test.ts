import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchGoogleApi } from "../auth/api";
import { listLoadBalancers } from "./api";

vi.mock("../auth/api", () => ({ fetchGoogleApi: vi.fn() }));

const fetchGoogleApiMock = vi.mocked(fetchGoogleApi);

describe("Load Balancing API", () => {
  beforeEach(() => fetchGoogleApiMock.mockReset());

  it("creates Console URLs for global and regional forwarding rules and global addresses", async () => {
    fetchGoogleApiMock.mockResolvedValueOnce({
      items: {
        global: {
          forwardingRules: [
            {
              id: "global-rule-id",
              name: "global-http-rule",
              IPAddress: "203.0.113.1",
              IPProtocol: "TCP",
              loadBalancingScheme: "EXTERNAL_MANAGED",
              selfLink: "https://www.googleapis.com/compute/v1/projects/sample-project/global/forwardingRules/global-http-rule",
            },
          ],
        },
        "regions/us-central1": {
          forwardingRules: [
            {
              id: "regional-rule-id",
              name: "regional-http-rule",
              IPAddress: "203.0.113.2",
              IPProtocol: "TCP",
              loadBalancingScheme: "EXTERNAL_MANAGED",
              selfLink:
                "https://www.googleapis.com/compute/v1/projects/sample-project/regions/us-central1/forwardingRules/regional-http-rule",
            },
          ],
        },
      },
    });
    fetchGoogleApiMock.mockResolvedValueOnce({
      items: [
        {
          id: "address-id",
          name: "global-ip",
          address: "203.0.113.3",
          selfLink: "https://www.googleapis.com/compute/v1/projects/sample-project/global/addresses/global-ip",
        },
      ],
    });

    await expect(listLoadBalancers("sample-project", "access-token")).resolves.toMatchObject([
      {
        type: "forwardingRule",
        id: "global-rule-id",
        region: "global",
        url: "https://console.cloud.google.com/net-services/loadbalancing/details/httpAdvanced/global-http-rule?project=sample-project",
      },
      {
        type: "forwardingRule",
        id: "regional-rule-id",
        region: "us-central1",
        url: "https://console.cloud.google.com/net-services/loadbalancing/details/regional/us-central1/regional-http-rule?project=sample-project",
      },
      {
        type: "address",
        id: "address-id",
        region: "global",
        url: "https://console.cloud.google.com/networking/addresses/details/global/global-ip?project=sample-project",
      },
    ]);
  });
});

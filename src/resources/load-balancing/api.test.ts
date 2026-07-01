import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchGoogleApi } from "../../auth/api";
import { listLoadBalancers } from "./api";

vi.mock("../../auth/api", () => ({ fetchGoogleApi: vi.fn() }));

const fetchGoogleApiMock = vi.mocked(fetchGoogleApi);

const forwardingRule = (args: { id: string; name: string; target?: string; backendService?: string }) => ({
  IPAddress: "203.0.113.1",
  IPProtocol: "TCP",
  loadBalancingScheme: "EXTERNAL",
  selfLink: `https://compute.googleapis.com/compute/v1/projects/sample-project/global/forwardingRules/${args.name}`,
  ...args,
});

describe("Load Balancing API", () => {
  beforeEach(() => fetchGoogleApiMock.mockReset());

  it("uses URL map names for Application Load Balancer Console URLs and excludes unrelated forwarding rules", async () => {
    fetchGoogleApiMock.mockResolvedValueOnce({
      items: {
        global: {
          forwardingRules: [
            forwardingRule({
              id: "global-app",
              name: "global-app",
              target: "projects/sample-project/global/targetHttpsProxies/global-app-proxy",
            }),
            forwardingRule({
              id: "global-network",
              name: "global-network",
              target: "projects/sample-project/global/targetTcpProxies/global-network-proxy",
            }),
            forwardingRule({
              id: "global-grpc-app",
              name: "global-grpc-app-forwarding-rule",
              target: "projects/sample-project/global/targetGrpcProxies/global-grpc-app-proxy",
            }),
            forwardingRule({
              id: "protocol-forwarding",
              name: "protocol-forwarding",
              target: "projects/sample-project/zones/us-central1-a/targetInstances/protocol-target",
            }),
          ],
        },
        "regions/us-central1": {
          forwardingRules: [
            forwardingRule({
              id: "regional-app",
              name: "regional-app",
              target: "projects/sample-project/regions/us-central1/targetHttpProxies/regional-app-proxy",
            }),
            forwardingRule({
              id: "regional-network",
              name: "regional-network",
              backendService: "projects/sample-project/regions/us-central1/backendServices/regional-network-backend",
            }),
          ],
        },
      },
    });
    fetchGoogleApiMock.mockResolvedValueOnce({
      urlMap: "projects/sample-project/global/urlMaps/global-app-url-map",
    });
    fetchGoogleApiMock.mockResolvedValueOnce({
      urlMap: "projects/sample-project/global/urlMaps/global-grpc-url-map",
    });
    fetchGoogleApiMock.mockResolvedValueOnce({
      urlMap: "projects/sample-project/regions/us-central1/urlMaps/regional-app-url-map",
    });

    const resources = await listLoadBalancers("sample-project", "access-token");

    expect(fetchGoogleApiMock).toHaveBeenCalledWith(
      "https://compute.googleapis.com/compute/v1/projects/sample-project/global/targetHttpsProxies/global-app-proxy",
      "access-token",
    );
    expect(fetchGoogleApiMock).toHaveBeenCalledWith(
      "https://compute.googleapis.com/compute/v1/projects/sample-project/global/targetGrpcProxies/global-grpc-app-proxy",
      "access-token",
    );
    expect(fetchGoogleApiMock).toHaveBeenCalledWith(
      "https://compute.googleapis.com/compute/v1/projects/sample-project/regions/us-central1/targetHttpProxies/regional-app-proxy",
      "access-token",
    );
    expect(resources.map(({ name, url }) => ({ name, url }))).toEqual([
      {
        name: "global-app",
        url: "https://console.cloud.google.com/net-services/loadbalancing/details/httpAdvanced/global-app-url-map?project=sample-project",
      },
      {
        name: "global-network",
        url: "https://console.cloud.google.com/loadbalancing/advanced/forwardingRules/list?project=sample-project",
      },
      {
        name: "global-grpc-app-forwarding-rule",
        url: "https://console.cloud.google.com/net-services/loadbalancing/details/httpAdvanced/global-grpc-url-map?project=sample-project",
      },
      {
        name: "regional-app",
        url: "https://console.cloud.google.com/net-services/loadbalancing/details/regional/us-central1/regional-app-url-map?project=sample-project",
      },
      {
        name: "regional-network",
        url: "https://console.cloud.google.com/loadbalancing/advanced/forwardingRules/list?project=sample-project",
      },
    ]);
  });

  it("falls back to the Forwarding Rules page when Application Load Balancer name cannot be resolved", async () => {
    fetchGoogleApiMock.mockResolvedValueOnce({
      items: {
        global: {
          forwardingRules: [
            forwardingRule({
              id: "global-app",
              name: "global-app-forwarding-rule",
              target: "projects/sample-project/global/targetHttpsProxies/global-app-proxy",
            }),
          ],
        },
      },
    });
    fetchGoogleApiMock.mockRejectedValueOnce(new Error("target proxy unavailable"));

    const resources = await listLoadBalancers("sample-project", "access-token");

    expect(resources).toEqual([
      {
        type: "forwardingRule",
        id: "global-app",
        name: "global-app-forwarding-rule",
        IPAddress: "203.0.113.1",
        IPProtocol: "TCP",
        portRange: undefined,
        ports: undefined,
        target: "projects/sample-project/global/targetHttpsProxies/global-app-proxy",
        region: "global",
        loadBalancingScheme: "EXTERNAL",
        url: "https://console.cloud.google.com/loadbalancing/advanced/forwardingRules/list?project=sample-project",
      },
    ]);
  });
});

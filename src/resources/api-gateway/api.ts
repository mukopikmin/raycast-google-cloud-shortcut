import { fetchGoogleApi } from "../../auth/api";
import { PageOptions, ResourcePage } from "../../pagination/types";
import { ApiGateway } from "./types";

type GatewaysResponse = {
  gateways?: {
    name: string;
    displayName?: string;
    state?: string;
    defaultHostname?: string;
  }[];
  nextPageToken?: string;
};

/** Lists gateways across all regions using the API's wildcard location. */
export const listApiGatewaysPage = async (
  projectId: string,
  accessToken: string,
  options: PageOptions,
): Promise<ResourcePage<ApiGateway>> => {
  const query = new URLSearchParams({ pageSize: options.pageSize.toString() });
  if (options.pageToken) query.set("pageToken", options.pageToken);

  const body = await fetchGoogleApi<GatewaysResponse>(
    `https://apigateway.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/locations/-/gateways?${query.toString()}`,
    accessToken,
  );

  return {
    resources: (body.gateways ?? []).map((gateway) => {
      const parts = gateway.name.split("/");
      const region = parts[3];
      const name = parts[5];
      return {
        id: gateway.name,
        name,
        displayName: gateway.displayName,
        region,
        state: gateway.state,
        defaultHostname: gateway.defaultHostname,
        url: `https://console.cloud.google.com/api-gateway/gateway/${encodeURIComponent(region)}/${encodeURIComponent(name)}?project=${encodeURIComponent(projectId)}`,
      };
    }),
    nextPageToken: body.nextPageToken,
  };
};

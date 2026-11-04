import { fetchGoogleApi } from "../../auth/api";
import { PageOptions, ResourcePage } from "../../pagination/types";
import { ApiGateway, ApiGatewaysResponse } from "./types";

/** List gateways across all regions, fetching only the requested page. */
export const listApiGatewaysPage = async (
  projectId: string,
  accessToken: string,
  options: PageOptions,
): Promise<ResourcePage<ApiGateway>> => {
  const query = new URLSearchParams({ pageSize: options.pageSize.toString() });
  if (options.pageToken) query.set("pageToken", options.pageToken);

  const body = await fetchGoogleApi<ApiGatewaysResponse>(
    `https://apigateway.googleapis.com/v1/projects/${projectId}/locations/-/gateways?${query.toString()}`,
    accessToken,
  );

  return {
    resources: (body.gateways ?? []).map((gateway) => {
      const parts = gateway.name.split("/");
      const region = parts[3];
      const name = parts[5];
      return {
        ...gateway,
        id: gateway.name,
        name,
        region,
        url: `https://console.cloud.google.com/api-gateway/gateway/${region}/${name}?project=${projectId}`,
      };
    }),
    nextPageToken: body.nextPageToken,
    unreachable: body.unreachableLocations,
  };
};

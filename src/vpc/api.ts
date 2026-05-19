import { fetchGoogleApi } from "../auth/api";
import { VpcNetwork } from "./types";

type VpcNetworksResponse = {
  items?: {
    id: string;
    name: string;
    autoCreateSubnetworks: boolean;
    selfLink: string;
  }[];
};

/**
 * @see https://cloud.google.com/compute/docs/reference/rest/v1/networks/list
 */
export const listVpcNetworks = async (projectId: string, accessToken: string): Promise<VpcNetwork[]> => {
  const body = await fetchGoogleApi<VpcNetworksResponse>(
    `https://compute.googleapis.com/compute/v1/projects/${projectId}/global/networks`,
    accessToken,
  );

  return (
    body.items?.map((network) => {
      return {
        id: network.id,
        name: network.name,
        subnetworkMode: network.autoCreateSubnetworks ? "Auto" : "Custom",
        url: `https://console.cloud.google.com/networking/networks/details/${network.name}?project=${projectId}`,
        keywords: [network.name],
      };
    }) ?? []
  );
};

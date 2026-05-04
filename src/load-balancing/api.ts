import { fetchGoogleApi } from "../auth/api";
import { ForwardingRule } from "./types";

type AggregatedForwardingRulesResponse = {
  items?: {
    [key: string]: {
      forwardingRules?: {
        id: string;
        name: string;
        IPAddress: string;
        IPProtocol: string;
        portRange?: string;
        ports?: string[];
        target?: string;
        region?: string;
        loadBalancingScheme: string;
        selfLink: string;
      }[];
    };
  };
};

/**
 * @see https://cloud.google.com/compute/docs/reference/rest/v1/forwardingRules/aggregatedList
 */
export const listForwardingRules = async (projectId: string, accessToken: string): Promise<ForwardingRule[]> => {
  const body = await fetchGoogleApi<AggregatedForwardingRulesResponse>(
    `https://compute.googleapis.com/compute/v1/projects/${projectId}/aggregated/forwardingRules`,
    accessToken,
  );

  const rules: ForwardingRule[] = [];

  if (body.items) {
    for (const regionKey in body.items) {
      const regionData = body.items[regionKey];
      if (regionData.forwardingRules) {
        for (const rule of regionData.forwardingRules) {
          const region = rule.region ? rule.region.split("/").pop() : "global";

          rules.push({
            id: rule.id,
            name: rule.name,
            IPAddress: rule.IPAddress,
            IPProtocol: rule.IPProtocol,
            portRange: rule.portRange,
            ports: rule.ports,
            target: rule.target,
            region: region,
            loadBalancingScheme: rule.loadBalancingScheme,
            url: `https://console.cloud.google.com/net-services/loadbalancing/details/${region === "global" ? "global" : "regional"}/${region}/${rule.name}?project=${projectId}`,
          });
        }
      }
    }
  }

  return rules;
};

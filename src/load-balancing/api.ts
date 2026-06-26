import { fetchGoogleApi } from "../auth/api";
import { ForwardingRule, GlobalAddress, LoadBalancerResource } from "./types";

type ForwardingRuleResponse = {
  id: string;
  name: string;
  IPAddress: string;
  IPProtocol: string;
  portRange?: string;
  ports?: string[];
  target?: string;
  backendService?: string;
  region?: string;
  loadBalancingScheme: string;
  selfLink: string;
};

type AggregatedForwardingRulesResponse = {
  items?: {
    [key: string]: {
      forwardingRules?: ForwardingRuleResponse[];
    };
  };
};

const applicationLoadBalancerTargets = ["/targetHttpProxies/", "/targetHttpsProxies/"];
const loadBalancerTargets = [
  ...applicationLoadBalancerTargets,
  "/targetGrpcProxies/",
  "/targetSslProxies/",
  "/targetTcpProxies/",
  "/targetPools/",
];

const isLoadBalancerForwardingRule = (rule: ForwardingRuleResponse): boolean => {
  return Boolean(rule.backendService || loadBalancerTargets.some((targetType) => rule.target?.includes(targetType)));
};

const createForwardingRuleConsoleUrl = (rule: ForwardingRuleResponse, region: string, projectId: string): string => {
  const isApplicationLoadBalancer = applicationLoadBalancerTargets.some((targetType) =>
    rule.target?.includes(targetType),
  );

  if (isApplicationLoadBalancer) {
    return region === "global"
      ? `https://console.cloud.google.com/net-services/loadbalancing/details/httpAdvanced/${rule.name}?project=${projectId}`
      : `https://console.cloud.google.com/net-services/loadbalancing/details/regional/${region}/${rule.name}?project=${projectId}`;
  }

  return `https://console.cloud.google.com/loadbalancing/advanced/forwardingRules/list?project=${projectId}`;
};

type GlobalAddressesResponse = {
  items?: {
    id: string;
    name: string;
    address: string;
    selfLink: string;
  }[];
};

export const listLoadBalancers = async (projectId: string, accessToken: string): Promise<LoadBalancerResource[]> => {
  const [forwardingRules, globalAddresses] = await Promise.all([
    listForwardingRules(projectId, accessToken),
    listGlobalAddresses(projectId, accessToken),
  ]);

  return [...forwardingRules, ...globalAddresses];
};

const listForwardingRules = async (projectId: string, accessToken: string): Promise<ForwardingRule[]> => {
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
          if (!isLoadBalancerForwardingRule(rule)) continue;

          const region = regionKey.split("/").pop() ?? "global";

          rules.push({
            type: "forwardingRule",
            id: rule.id,
            name: rule.name,
            IPAddress: rule.IPAddress,
            IPProtocol: rule.IPProtocol,
            portRange: rule.portRange,
            ports: rule.ports,
            target: rule.target,
            region: region,
            loadBalancingScheme: rule.loadBalancingScheme,
            url: createForwardingRuleConsoleUrl(rule, region, projectId),
          });
        }
      }
    }
  }

  return rules;
};

const listGlobalAddresses = async (projectId: string, accessToken: string): Promise<GlobalAddress[]> => {
  const body = await fetchGoogleApi<GlobalAddressesResponse>(
    `https://compute.googleapis.com/compute/v1/projects/${projectId}/global/addresses`,
    accessToken,
  );

  return (
    body.items?.map((item) => ({
      type: "address",
      id: item.id,
      name: item.name,
      address: item.address,
      region: "global",
      url: `https://console.cloud.google.com/networking/addresses/details/global/${item.name}?project=${projectId}`,
    })) ?? []
  );
};

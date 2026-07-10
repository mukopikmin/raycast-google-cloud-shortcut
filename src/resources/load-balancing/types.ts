export type ForwardingRule = {
  type: "forwardingRule";
  id: string;
  name: string;
  IPAddress: string;
  IPProtocol: string;
  portRange?: string;
  ports?: string[];
  target?: string;
  region: string;
  loadBalancingScheme: string;
  url: string;
};

export type LoadBalancerResource = ForwardingRule;

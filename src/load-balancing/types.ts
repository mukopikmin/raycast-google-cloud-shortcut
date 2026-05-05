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

export type GlobalAddress = {
  type: "address";
  id: string;
  name: string;
  address: string;
  region: "global";
  url: string;
};

export type LoadBalancerResource = ForwardingRule | GlobalAddress;

export type ForwardingRule = {
  id: string;
  name: string;
  IPAddress: string;
  IPProtocol: string;
  portRange?: string;
  ports?: string[];
  target?: string;
  region?: string; // URL or "global"
  loadBalancingScheme: string;
  url: string;
};

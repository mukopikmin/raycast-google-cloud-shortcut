export type ApiGateway = {
  id: string;
  name: string;
  displayName?: string;
  region: string;
  state?: string;
  defaultHostname?: string;
  apiConfig?: string;
  url: string;
};

export type ApiGatewaysResponse = {
  gateways?: {
    name: string;
    displayName?: string;
    state?: string;
    defaultHostname?: string;
    apiConfig?: string;
  }[];
  nextPageToken?: string;
  unreachableLocations?: string[];
};

export type CloudRunDeployment = {
  id: string;
  name: string;
  region: string;
  deployType: CloudRunDeployType;
  url: string;
  uri?: string;
  keywords: string[];
};

export type CloudRunDeployType = "Function Services" | "Container Services" | "Jobs" | "Worker Pools";

export const createCloudRunDeployment = (args: {
  id: string;
  name: string;
  region: string;
  deployType: CloudRunDeployType;
  url: string;
  uri?: string;
}): CloudRunDeployment => {
  return {
    id: args.id,
    name: args.name,
    region: args.region,
    deployType: args.deployType,
    url: args.url,
    uri: args.uri,
    keywords: [args.name, args.region, args.deployType],
  };
};

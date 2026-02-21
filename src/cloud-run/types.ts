export type CloudRunDeployment = {
  id: string;
  name: string;
  region: string;
  deployType: CloudRunDeployType;
  url: string;
};

export type CloudRunDeployType =
  | "Function Services"
  | "Container Services"
  | "Jobs"
  | "Worker Pools";

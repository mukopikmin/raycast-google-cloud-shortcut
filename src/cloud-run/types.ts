export type CloudRunDeployment = {
  id: string;
  name: string;
  region: string;
  deployType: CloudRunDeployType;
  url: string;
};

export type CloudRunDeployType = "services" | "jobs" | "worker pools";

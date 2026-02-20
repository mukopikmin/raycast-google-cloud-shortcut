export type CloudRun = {
  id: string;
  name: string;
  region: string;
  type: CloudRunType;
  url: string;
};

export type CloudRunType = "services" | "jobs" | "worker pools";

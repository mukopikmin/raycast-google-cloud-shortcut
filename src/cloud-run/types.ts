import { CloudLoggingTarget } from "../actions/cloud-logging/types";

export type CloudRunDeployment = {
  id: string;
  deployType: CloudRunDeployType;
  url: string;
  keywords: string[];
} & Extract<CloudLoggingTarget, { kind: "cloud-run-job" | "cloud-run-service" | "cloud-run-worker-pool" }>;

export type CloudRunDeployType = "Function Services" | "Container Services" | "Jobs" | "Worker Pools";

export const createCloudRunDeployment = (args: {
  id: string;
  name: string;
  region: string;
  deployType: CloudRunDeployType;
  projectId: string;
  url: string;
}): CloudRunDeployment => {
  const kind =
    args.deployType === "Jobs"
      ? "cloud-run-job"
      : args.deployType === "Worker Pools"
        ? "cloud-run-worker-pool"
        : "cloud-run-service";

  return {
    id: args.id,
    kind,
    projectId: args.projectId,
    name: args.name,
    region: args.region,
    deployType: args.deployType,
    url: args.url,
    keywords: [args.name, args.region, args.deployType],
  };
};

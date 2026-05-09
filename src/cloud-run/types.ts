import { CloudLoggingTarget } from "../actions/cloud-logging/types";

export type CloudRunDeployment = {
  id: string;
  deployType: CloudRunDeployType;
  url: string;
  keywords: string[];
} & Extract<CloudLoggingTarget, { kind: "cloud-run-job" | "cloud-run-service" | "cloud-run-worker-pool" }>;

export type CloudRunDeployType = "Function Services" | "Container Services" | "Jobs" | "Worker Pools";

const cloudRunLoggingKindByDeployType: Record<
  CloudRunDeployType,
  Extract<CloudLoggingTarget, { kind: "cloud-run-job" | "cloud-run-service" | "cloud-run-worker-pool" }>["kind"]
> = {
  "Function Services": "cloud-run-service",
  "Container Services": "cloud-run-service",
  Jobs: "cloud-run-job",
  "Worker Pools": "cloud-run-worker-pool",
};

export const createCloudRunDeployment = (args: {
  id: string;
  name: string;
  region: string;
  deployType: CloudRunDeployType;
  projectId: string;
  url: string;
}): CloudRunDeployment => {
  return {
    id: args.id,
    kind: cloudRunLoggingKindByDeployType[args.deployType],
    projectId: args.projectId,
    name: args.name,
    region: args.region,
    deployType: args.deployType,
    url: args.url,
    keywords: [args.name, args.region, args.deployType],
  };
};

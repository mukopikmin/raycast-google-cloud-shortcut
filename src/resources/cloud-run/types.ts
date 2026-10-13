import { CloudLoggingTarget } from "../../actions/cloud-logging/types";
import { PageOptions } from "../../pagination/types";

export type CloudRunPageOptions = PageOptions & { signal?: AbortSignal };

export type CloudRunDeployment = {
  id: string;
  deployType: CloudRunDeployType;
  url: string;
  uri?: string;
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
  uri?: string;
}): CloudRunDeployment => {
  return {
    id: args.id,
    kind: cloudRunLoggingKindByDeployType[args.deployType],
    projectId: args.projectId,
    name: args.name,
    region: args.region,
    deployType: args.deployType,
    url: args.url,
    uri: args.uri,
    keywords: [args.name, args.region, args.deployType],
  };
};

export type CloudRunDeploymentPage = {
  deployments: CloudRunDeployment[];
  nextPageToken?: string;
};

export type CloudRunServicesPage = CloudRunDeploymentPage & {
  unreachable: string[];
};

export type CloudRunRegionStream = { region: string; nextPageToken?: string };
export type CloudRunRegionalResult =
  { stream: CloudRunRegionStream; page: CloudRunServicesPage } | { stream: CloudRunRegionStream; error: unknown };

export type CloudRunServicesCursor = {
  phase: "global" | "locations" | "regional" | "done";
  globalNextPageToken?: string;
  locationsNextPageToken?: string;
  regions: string[];
  ready: CloudRunRegionStream[];
  inFlight: Map<string, Promise<CloudRunRegionalResult>>;
  seenRegions: Set<string>;
  completedRegions: Set<string>;
  continuation: number;
  controller: AbortController;
};

export type CloudRunRegionsCache = { scope: object; regions: string[]; expiresAt: number };

export type CloudRunServicesResponse = {
  items?: {
    metadata: {
      name: string;
      uid: string;
      labels: Record<string, string>;
      annotations?: Record<string, string>;
    };
    status?: { url?: string };
  }[];
  metadata?: { continue?: string };
  unreachable?: string[];
};

export type CloudRunRegionalServicesResponse = {
  services?: {
    name: string;
    uid?: string;
    uri?: string;
    labels?: Record<string, string>;
    buildConfig?: { functionTarget?: string };
  }[];
  nextPageToken?: string;
};

export type CloudRunServicesState = {
  services: CloudRunDeployment[];
  nextPageToken?: string;
  unreachable: string[];
  isTruncated: boolean;
};

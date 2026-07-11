import { CloudLoggingTarget } from "./types";

type CloudLoggingFilter = {
  key: string;
  value: string;
};

const createCloudLoggingQueryFromFilters = (filters: CloudLoggingFilter[]): string => {
  return filters.map(({ key, value }) => `${key}=${JSON.stringify(value)}`).join("\n");
};

const createCloudLoggingQuery = (target: CloudLoggingTarget): string => {
  switch (target.kind) {
    case "cloud-function-gen1":
      return createCloudLoggingQueryFromFilters([
        { key: "resource.type", value: "cloud_function" },
        { key: "resource.labels.function_name", value: target.name },
        { key: "resource.labels.region", value: target.region },
      ]);
    case "cloud-run-job":
      return createCloudLoggingQueryFromFilters([
        { key: "resource.type", value: "cloud_run_job" },
        { key: "resource.labels.job_name", value: target.name },
        { key: "resource.labels.location", value: target.region },
      ]);
    case "cloud-run-service":
      return createCloudLoggingQueryFromFilters([
        { key: "resource.type", value: "cloud_run_revision" },
        { key: "resource.labels.service_name", value: target.name },
        { key: "resource.labels.location", value: target.region },
      ]);
    case "cloud-run-worker-pool":
      return createCloudLoggingQueryFromFilters([
        { key: "resource.type", value: "cloud_run_worker_pool" },
        { key: "resource.labels.worker_pool_name", value: target.name },
        { key: "resource.labels.location", value: target.region },
      ]);
    case "kubernetes-engine-cluster":
      return createCloudLoggingQueryFromFilters([
        { key: "resource.type", value: "k8s_container" },
        { key: "resource.labels.cluster_name", value: target.name },
        { key: "resource.labels.location", value: target.location },
      ]);
  }
};

export const createCloudLoggingUrl = (target: CloudLoggingTarget): string => {
  return `https://console.cloud.google.com/logs/query;query=${encodeURIComponent(createCloudLoggingQuery(target))}?project=${encodeURIComponent(target.projectId)}`;
};

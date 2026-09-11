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
    case "app-engine-service":
      return createCloudLoggingQueryFromFilters([
        { key: "resource.type", value: "gae_app" },
        { key: "resource.labels.module_id", value: target.name },
      ]);
    case "alloydb-cluster":
      return createCloudLoggingQueryFromFilters([
        { key: "resource.type", value: "alloydb.googleapis.com/Cluster" },
        { key: "resource.labels.cluster_id", value: target.clusterId },
        { key: "resource.labels.location", value: target.region },
      ]);
    case "workflow":
      return createCloudLoggingQueryFromFilters([
        { key: "resource.type", value: "workflows.googleapis.com/Workflow" },
        { key: "resource.labels.resource_container", value: target.projectId },
        { key: "resource.labels.location", value: target.region },
        { key: "resource.labels.workflow_id", value: target.name },
      ]);
    case "cloud-sql-instance":
      return createCloudLoggingQueryFromFilters([
        { key: "resource.type", value: "cloudsql_database" },
        { key: "resource.labels.project_id", value: target.projectId },
        { key: "resource.labels.database_id", value: `${target.projectId}:${target.instanceId}` },
        { key: "resource.labels.region", value: target.region },
      ]);
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
    case "secret-manager-secret":
      return createCloudLoggingQueryFromFilters([
        { key: "resource.type", value: "audited_resource" },
        { key: "resource.labels.service", value: "secretmanager.googleapis.com" },
        { key: "protoPayload.resourceName", value: target.resourceName },
      ]);
  }
};

export const createCloudLoggingUrl = (target: CloudLoggingTarget): string => {
  return `https://console.cloud.google.com/logs/query;query=${encodeURIComponent(createCloudLoggingQuery(target))}?project=${encodeURIComponent(target.projectId)}`;
};

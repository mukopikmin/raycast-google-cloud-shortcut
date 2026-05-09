import { CloudLoggingTarget } from "./types";

const createCloudLoggingQuery = (target: CloudLoggingTarget): string => {
  switch (target.kind) {
    case "cloud-function-gen1":
      return [
        'resource.type="cloud_function"',
        `resource.labels.function_name="${target.name}"`,
        `resource.labels.region="${target.region}"`,
      ].join("\n");
    case "cloud-run-job":
      return [
        'resource.type="cloud_run_job"',
        `resource.labels.job_name="${target.name}"`,
        `resource.labels.location="${target.region}"`,
      ].join("\n");
    case "cloud-run-service":
      return [
        'resource.type="cloud_run_revision"',
        `resource.labels.service_name="${target.name}"`,
        `resource.labels.location="${target.region}"`,
      ].join("\n");
    case "cloud-run-worker-pool":
      return [
        'resource.type="cloud_run_worker_pool"',
        `resource.labels.worker_pool_name="${target.name}"`,
        `resource.labels.location="${target.region}"`,
      ].join("\n");
  }
};

export const createCloudLoggingUrl = (target: CloudLoggingTarget): string => {
  return `https://console.cloud.google.com/logs/query;query=${encodeURIComponent(createCloudLoggingQuery(target))}?project=${encodeURIComponent(target.projectId)}`;
};

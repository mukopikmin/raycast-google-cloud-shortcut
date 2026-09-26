import { CloudLoggingTarget } from "./types";

type CloudAuditLoggingIdentity = {
  serviceName: string;
  resourceName: string;
};

const getCloudAuditLoggingIdentity = (target: CloudLoggingTarget): CloudAuditLoggingIdentity => {
  switch (target.kind) {
    case "app-engine-service":
      return {
        serviceName: "appengine.googleapis.com",
        resourceName: `apps/${target.projectId}/services/${target.name}`,
      };
    case "alloydb-cluster":
      return {
        serviceName: "alloydb.googleapis.com",
        resourceName: `projects/${target.projectId}/locations/${target.region}/clusters/${target.clusterId}`,
      };
    case "workflow":
      return {
        serviceName: "workflows.googleapis.com",
        resourceName: `projects/${target.projectId}/locations/${target.region}/workflows/${target.name}`,
      };
    case "cloud-sql-instance":
      return {
        serviceName: "cloudsql.googleapis.com",
        resourceName: `projects/${target.projectId}/instances/${target.instanceId}`,
      };
    case "cloud-function-gen1":
      return {
        serviceName: "cloudfunctions.googleapis.com",
        resourceName: `projects/${target.projectId}/locations/${target.region}/functions/${target.name}`,
      };
    case "cloud-run-job":
      return {
        serviceName: "run.googleapis.com",
        resourceName: `projects/${target.projectId}/locations/${target.region}/jobs/${target.name}`,
      };
    case "cloud-run-service":
      return {
        serviceName: "run.googleapis.com",
        resourceName: `projects/${target.projectId}/locations/${target.region}/services/${target.name}`,
      };
    case "cloud-run-worker-pool":
      return {
        serviceName: "run.googleapis.com",
        resourceName: `projects/${target.projectId}/locations/${target.region}/workerPools/${target.name}`,
      };
    case "secret-manager-secret":
      return {
        serviceName: "secretmanager.googleapis.com",
        resourceName: target.resourceName,
      };
  }
};

export const createCloudAuditLoggingUrl = (target: CloudLoggingTarget): string => {
  const identity = getCloudAuditLoggingIdentity(target);
  const query = [
    `protoPayload.@type=${JSON.stringify("type.googleapis.com/google.cloud.audit.AuditLog")}`,
    `protoPayload.serviceName=${JSON.stringify(identity.serviceName)}`,
    `protoPayload.resourceName=${JSON.stringify(identity.resourceName)}`,
  ].join("\n");

  return `https://console.cloud.google.com/logs/query;query=${encodeURIComponent(query)}?project=${encodeURIComponent(target.projectId)}`;
};

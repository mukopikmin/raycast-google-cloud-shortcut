import { describe, expect, it } from "vitest";
import { createCloudAuditLoggingUrl } from "./createCloudAuditLoggingUrl";
import { CloudLoggingTarget } from "./types";

const parseCloudAuditLoggingUrl = (url: string): { query: string; projectId: string } => {
  const parsedUrl = new URL(url);
  const queryMatch = parsedUrl.pathname.match(/\/logs\/query;query=([^?]+)/);

  if (!queryMatch) {
    throw new Error(`Cloud Audit Logging query is missing: ${url}`);
  }

  return {
    query: decodeURIComponent(queryMatch[1]),
    projectId: parsedUrl.searchParams.get("project") ?? "",
  };
};

const targets: { name: string; target: CloudLoggingTarget; serviceName: string; resourceName: string }[] = [
  {
    name: "App Engine service",
    target: { kind: "app-engine-service", projectId: "sample-project", name: "api-service" },
    serviceName: "appengine.googleapis.com",
    resourceName: "apps/sample-project/services/api-service",
  },
  {
    name: "AlloyDB cluster",
    target: {
      kind: "alloydb-cluster",
      projectId: "sample-project",
      clusterId: "primary-cluster",
      region: "asia-northeast1",
    },
    serviceName: "alloydb.googleapis.com",
    resourceName: "projects/sample-project/locations/asia-northeast1/clusters/primary-cluster",
  },
  {
    name: "Cloud Function",
    target: {
      kind: "cloud-function-gen1",
      projectId: "sample-project",
      name: "hello-function",
      region: "us-central1",
    },
    serviceName: "cloudfunctions.googleapis.com",
    resourceName: "projects/sample-project/locations/us-central1/functions/hello-function",
  },
  {
    name: "Cloud Run job",
    target: {
      kind: "cloud-run-job",
      projectId: "sample-project",
      name: "daily-job",
      region: "asia-northeast1",
    },
    serviceName: "run.googleapis.com",
    resourceName: "projects/sample-project/locations/asia-northeast1/jobs/daily-job",
  },
  {
    name: "Cloud Run service",
    target: {
      kind: "cloud-run-service",
      projectId: "sample-project",
      name: "api-service",
      region: "europe-west1",
    },
    serviceName: "run.googleapis.com",
    resourceName: "projects/sample-project/locations/europe-west1/services/api-service",
  },
  {
    name: "Cloud Run worker pool",
    target: {
      kind: "cloud-run-worker-pool",
      projectId: "sample-project",
      name: "worker-pool",
      region: "us-west1",
    },
    serviceName: "run.googleapis.com",
    resourceName: "projects/sample-project/locations/us-west1/workerPools/worker-pool",
  },
  {
    name: "Cloud SQL instance",
    target: {
      kind: "cloud-sql-instance",
      projectId: "sample-project",
      instanceId: "orders-db",
      region: "us-central1",
    },
    serviceName: "cloudsql.googleapis.com",
    resourceName: "projects/sample-project/instances/orders-db",
  },
  {
    name: "Secret Manager secret",
    target: {
      kind: "secret-manager-secret",
      projectId: "sample-project",
      name: "database-password",
      resourceName: "projects/sample-project/secrets/database-password",
    },
    serviceName: "secretmanager.googleapis.com",
    resourceName: "projects/sample-project/secrets/database-password",
  },
  {
    name: "workflow",
    target: {
      kind: "workflow",
      projectId: "sample-project",
      name: "invoice-flow",
      region: "asia-northeast1",
    },
    serviceName: "workflows.googleapis.com",
    resourceName: "projects/sample-project/locations/asia-northeast1/workflows/invoice-flow",
  },
];

describe("createCloudAuditLoggingUrl", () => {
  it.each(targets)("creates an audit log query for $name", ({ target, serviceName, resourceName }) => {
    expect(parseCloudAuditLoggingUrl(createCloudAuditLoggingUrl(target))).toEqual({
      query: [
        'protoPayload.@type="type.googleapis.com/google.cloud.audit.AuditLog"',
        `protoPayload.serviceName=${JSON.stringify(serviceName)}`,
        `protoPayload.resourceName=${JSON.stringify(resourceName)}`,
      ].join("\n"),
      projectId: target.projectId,
    });
  });

  it("encodes special characters in query and project values", () => {
    const target: CloudLoggingTarget = {
      kind: "cloud-run-service",
      projectId: 'project with spaces & "quotes"',
      name: 'service/with spaces & "quotes"',
      region: "us-central1",
    };

    const url = createCloudAuditLoggingUrl(target);

    expect(url).toContain("protoPayload.serviceName%3D%22run.googleapis.com%22");
    expect(url).toContain("service%2Fwith%20spaces%20%26%20%5C%22quotes%5C%22");
    expect(url).toContain("project=project%20with%20spaces%20%26%20%22quotes%22");
    expect(parseCloudAuditLoggingUrl(url).projectId).toBe(target.projectId);
  });
});

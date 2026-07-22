import { describe, expect, it } from "vitest";
import { createCloudLoggingUrl } from "./createCloudLoggingUrl";
import { CloudLoggingTarget } from "./types";

const parseCloudLoggingUrl = (url: string): { query: string; projectId: string } => {
  const parsedUrl = new URL(url);
  const queryMatch = parsedUrl.pathname.match(/\/logs\/query;query=([^?]+)/);

  if (!queryMatch) {
    throw new Error(`Cloud Logging query is missing: ${url}`);
  }

  return {
    query: decodeURIComponent(queryMatch[1]),
    projectId: parsedUrl.searchParams.get("project") ?? "",
  };
};

describe("createCloudLoggingUrl", () => {
  it("creates an AlloyDB cluster log query", () => {
    const target: CloudLoggingTarget = {
      kind: "alloydb-cluster",
      projectId: "sample-project",
      clusterId: "primary-cluster",
      region: "asia-northeast1",
    };

    expect(parseCloudLoggingUrl(createCloudLoggingUrl(target))).toEqual({
      query: [
        'resource.type="alloydb.googleapis.com/Cluster"',
        'resource.labels.cluster_id="primary-cluster"',
        'resource.labels.location="asia-northeast1"',
      ].join("\n"),
      projectId: "sample-project",
    });
  });

  it("creates a Cloud Functions gen1 log query", () => {
    const target: CloudLoggingTarget = {
      kind: "cloud-function-gen1",
      projectId: "sample-project",
      name: "hello-function",
      region: "us-central1",
    };

    expect(parseCloudLoggingUrl(createCloudLoggingUrl(target))).toEqual({
      query: [
        'resource.type="cloud_function"',
        'resource.labels.function_name="hello-function"',
        'resource.labels.region="us-central1"',
      ].join("\n"),
      projectId: "sample-project",
    });
  });

  it("creates a Cloud Run job log query", () => {
    const target: CloudLoggingTarget = {
      kind: "cloud-run-job",
      projectId: "sample-project",
      name: "daily-job",
      region: "asia-northeast1",
    };

    expect(parseCloudLoggingUrl(createCloudLoggingUrl(target))).toEqual({
      query: [
        'resource.type="cloud_run_job"',
        'resource.labels.job_name="daily-job"',
        'resource.labels.location="asia-northeast1"',
      ].join("\n"),
      projectId: "sample-project",
    });
  });

  it("creates a Cloud Run service log query", () => {
    const target: CloudLoggingTarget = {
      kind: "cloud-run-service",
      projectId: "sample-project",
      name: "api-service",
      region: "europe-west1",
    };

    expect(parseCloudLoggingUrl(createCloudLoggingUrl(target))).toEqual({
      query: [
        'resource.type="cloud_run_revision"',
        'resource.labels.service_name="api-service"',
        'resource.labels.location="europe-west1"',
      ].join("\n"),
      projectId: "sample-project",
    });
  });

  it("creates a Cloud Run worker pool log query", () => {
    const target: CloudLoggingTarget = {
      kind: "cloud-run-worker-pool",
      projectId: "sample-project",
      name: "worker-pool",
      region: "us-west1",
    };

    expect(parseCloudLoggingUrl(createCloudLoggingUrl(target))).toEqual({
      query: [
        'resource.type="cloud_run_worker_pool"',
        'resource.labels.worker_pool_name="worker-pool"',
        'resource.labels.location="us-west1"',
      ].join("\n"),
      projectId: "sample-project",
    });
  });

  it("creates a Cloud SQL instance log query", () => {
    const target: CloudLoggingTarget = {
      kind: "cloud-sql-instance",
      projectId: "sample-project",
      instanceId: "orders-db",
      region: "us-central1",
    };

    expect(parseCloudLoggingUrl(createCloudLoggingUrl(target))).toEqual({
      query: [
        'resource.type="cloudsql_database"',
        'resource.labels.project_id="sample-project"',
        'resource.labels.database_id="sample-project:orders-db"',
        'resource.labels.region="us-central1"',
      ].join("\n"),
      projectId: "sample-project",
    });
  });

  it("creates a Workflows log query", () => {
    const target: CloudLoggingTarget = {
      kind: "workflow",
      projectId: "sample-project",
      name: "invoice-flow",
      region: "asia-northeast1",
    };

    expect(parseCloudLoggingUrl(createCloudLoggingUrl(target))).toEqual({
      query: [
        'resource.type="workflows.googleapis.com/Workflow"',
        'resource.labels.resource_container="sample-project"',
        'resource.labels.location="asia-northeast1"',
        'resource.labels.workflow_id="invoice-flow"',
      ].join("\n"),
      projectId: "sample-project",
    });
  });

  it("encodes query and project values in the URL", () => {
    const target: CloudLoggingTarget = {
      kind: "cloud-run-service",
      projectId: "project with spaces",
      name: "service/with/slashes",
      region: "us-central1",
    };

    const url = createCloudLoggingUrl(target);

    expect(url).toContain("query=resource.type%3D%22cloud_run_revision%22");
    expect(url).toContain("service%2Fwith%2Fslashes");
    expect(url).toContain("project=project%20with%20spaces");
  });
});

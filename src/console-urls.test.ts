import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchGoogleApi } from "./auth/api";
import { listAlloyDbClusters } from "./resources/alloydb/api";
import { createAppEngineService } from "./resources/app-engine/types";
import { createCloudFunction } from "./resources/cloud-functions/types";
import { createCloudSchedulerJob } from "./resources/cloud-scheduler/types";
import { listCloudSqlInstances } from "./resources/cloud-sql/api";
import { listCloudStorageBucketsPage } from "./resources/cloud-storage/api";
import { listCloudTasksQueues } from "./resources/cloud-tasks/api";
import { listComputeEngineInstancesPage } from "./resources/compute-engine/api";
import { listErrorGroups } from "./resources/error-reporting/api";
import { fetchIamPolicies } from "./resources/iam/api";
import { createKubernetesEngineClusterUrl } from "./resources/kubernetes-engine/types";
import { listSecretManagerSecretsPage } from "./resources/secret-manager/api";
import { listVpcNetworks } from "./resources/vpc/api";

vi.mock("./auth/api", () => ({ fetchGoogleApi: vi.fn() }));

const fetchGoogleApiMock = vi.mocked(fetchGoogleApi);

describe("uncovered Console URL builders", () => {
  beforeEach(() => fetchGoogleApiMock.mockReset());

  it("creates an AlloyDB cluster URL from the resource name rather than its display name", async () => {
    fetchGoogleApiMock.mockResolvedValueOnce({
      clusters: [
        {
          uid: "cluster-uid",
          name: "projects/sample-project/locations/asia-northeast1/clusters/primary-cluster",
          displayName: "Primary Database",
          state: "READY",
        },
      ],
    });

    const clusters = await listAlloyDbClusters("sample-project", "access-token");

    expect(clusters[0].url).toBe(
      "https://console.cloud.google.com/alloydb/locations/asia-northeast1/clusters/primary-cluster?project=sample-project",
    );
  });

  it("creates an App Engine service URL", () => {
    expect(createAppEngineService({ projectId: "sample-project", id: "service-id", name: "backend" }).url).toBe(
      "https://console.cloud.google.com/appengine/services?project=sample-project&serviceId=backend",
    );
  });

  it("creates a Cloud Functions gen1 URL", () => {
    expect(
      createCloudFunction({
        projectId: "sample-project",
        id: "function-id",
        name: "process-order",
        region: "us-central1",
      }).url,
    ).toBe(
      "https://console.cloud.google.com/functions/details/us-central1/process-order?env=gen1&project=sample-project",
    );
  });

  it("creates a Cloud Scheduler edit URL", () => {
    expect(
      createCloudSchedulerJob({
        projectId: "sample-project",
        name: "nightly-job",
        region: "europe-west1",
        schedule: "0 0 * * *",
        timeZone: "UTC",
        description: "Nightly processing",
      }).url,
    ).toBe("https://console.cloud.google.com/cloudscheduler/jobs/edit/europe-west1/nightly-job?project=sample-project");
  });

  it("creates a Cloud SQL instance overview URL", async () => {
    fetchGoogleApiMock.mockResolvedValueOnce({
      items: [
        {
          name: "orders-db",
          region: "us-central1",
          state: "RUNNABLE",
          databaseVersion: "POSTGRES_17",
          instanceType: "CLOUD_SQL_INSTANCE",
        },
      ],
    });

    const instances = await listCloudSqlInstances("sample-project", "access-token");

    expect(instances[0].url).toBe(
      "https://console.cloud.google.com/sql/instances/orders-db/overview?project=sample-project",
    );
  });

  it("creates a Cloud Storage bucket URL", async () => {
    fetchGoogleApiMock.mockResolvedValueOnce({
      items: [{ id: "archive.example.com", name: "archive.example.com", location: "US" }],
    });

    const page = await listCloudStorageBucketsPage("sample-project", "access-token", { pageSize: 50 });

    expect(page.buckets[0].url).toBe(
      "https://console.cloud.google.com/storage/browser/archive.example.com?project=sample-project",
    );
  });

  it("creates a Cloud Tasks queue URL from its resource name", async () => {
    fetchGoogleApiMock.mockResolvedValueOnce({
      queues: [
        {
          name: "projects/sample-project/locations/asia-northeast1/queues/email-delivery",
          state: "RUNNING",
        },
      ],
    });

    const queues = await listCloudTasksQueues("sample-project", "asia-northeast1", "access-token");

    expect(queues[0].url).toBe(
      "https://console.cloud.google.com/cloudtasks/queue/asia-northeast1/email-delivery?project=sample-project",
    );
  });

  it("creates a Compute Engine instance URL from short zone and machine names", async () => {
    fetchGoogleApiMock.mockResolvedValueOnce({
      items: {
        "zones/asia-northeast1-a": {
          instances: [
            {
              id: "instance-id",
              name: "web-1",
              status: "RUNNING",
              zone: "https://compute.googleapis.com/compute/v1/projects/sample-project/zones/asia-northeast1-a",
              machineType:
                "https://compute.googleapis.com/compute/v1/projects/sample-project/zones/asia-northeast1-a/machineTypes/e2-medium",
            },
          ],
        },
      },
    });

    const page = await listComputeEngineInstancesPage("sample-project", "access-token", { pageSize: 50 });

    expect(page.instances[0].url).toBe(
      "https://console.cloud.google.com/compute/instancesDetail/zones/asia-northeast1-a/instances/web-1?project=sample-project",
    );
  });

  it("creates an Error Reporting group URL", async () => {
    fetchGoogleApiMock.mockResolvedValueOnce({
      errorGroupStats: [
        {
          group: { groupId: "error-group-id", name: "projects/sample-project/groups/error-group-id" },
          count: "10",
          affectedUsersCount: "2",
          representative: { message: "Failure" },
          firstSeenTime: "2026-07-01T00:00:00Z",
          lastSeenTime: "2026-07-02T00:00:00Z",
          numAffectedServices: 0,
          affectedServices: [],
          timedCounts: [],
        },
      ],
    });

    const groups = await listErrorGroups("sample-project", "access-token");

    expect(groups[0].url).toBe("https://console.cloud.google.com/errors/error-group-id?project=sample-project");
  });

  it("creates an IAM URL for every mapped member", async () => {
    fetchGoogleApiMock.mockResolvedValueOnce({
      bindings: [{ role: "roles/viewer", members: ["user:developer@example.com"] }],
    });

    const members = await fetchIamPolicies("sample-project", "access-token");

    expect(members[0].url).toBe("https://console.cloud.google.com/iam-admin/iam?project=sample-project");
  });

  it("creates a GKE cluster details URL", () => {
    expect(
      createKubernetesEngineClusterUrl({
        id: "cluster-id",
        name: "production",
        location: "asia-northeast1",
        status: "RUNNING",
        version: "1.34",
        nodeCount: 3,
        projectId: "sample-project",
      }),
    ).toBe(
      "https://console.cloud.google.com/kubernetes/clusters/details/asia-northeast1/production/details?project=sample-project",
    );
  });

  it("creates a Secret Manager secret URL from the short resource name", async () => {
    fetchGoogleApiMock.mockResolvedValueOnce({
      secrets: [{ name: "projects/sample-project/secrets/database-password" }],
    });

    const page = await listSecretManagerSecretsPage("sample-project", "access-token", { pageSize: 50 });

    expect(page.secrets[0].url).toBe(
      "https://console.cloud.google.com/security/secret-manager/secret/database-password?project=sample-project",
    );
  });

  it("creates a VPC network details URL", async () => {
    fetchGoogleApiMock.mockResolvedValueOnce({
      items: [
        {
          id: "network-id",
          name: "production-network",
          autoCreateSubnetworks: false,
          selfLink:
            "https://compute.googleapis.com/compute/v1/projects/sample-project/global/networks/production-network",
        },
      ],
    });

    const networks = await listVpcNetworks("sample-project", "access-token");

    expect(networks[0].url).toBe(
      "https://console.cloud.google.com/networking/networks/details/production-network?project=sample-project",
    );
  });
});

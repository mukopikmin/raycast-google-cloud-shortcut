import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchGoogleApi } from "../auth/api";
import { listCloudRunJobsPage, listCloudRunServicesPage, listCloudRunWorkerPoolsPage } from "./api";

vi.mock("../auth/api", () => ({ fetchGoogleApi: vi.fn() }));

const fetchGoogleApiMock = vi.mocked(fetchGoogleApi);

describe("Cloud Run API", () => {
  beforeEach(() => fetchGoogleApiMock.mockReset());

  it("creates service Console URLs from v2 service names", async () => {
    fetchGoogleApiMock.mockResolvedValueOnce({
      nextPageToken: "next-service-page",
      services: [
        {
          name: "projects/sample-project/locations/asia-northeast1/services/api-service",
          uid: "service-uid",
          generation: "1",
          uri: "https://api-service.example.com",
        },
      ],
    });

    await expect(
      listCloudRunServicesPage("sample-project", "asia-northeast1", "access-token", {
        pageSize: 50,
        pageToken: "service-page",
      }),
    ).resolves.toMatchObject({
      nextPageToken: "next-service-page",
      deployments: [
        {
          id: "service-uid",
          name: "api-service",
          region: "asia-northeast1",
          deployType: "Container Services",
          url: "https://console.cloud.google.com/run/detail/asia-northeast1/api-service?project=sample-project",
        },
      ],
    });
    expect(fetchGoogleApiMock).toHaveBeenCalledWith(
      "https://run.googleapis.com/v2/projects/sample-project/locations/asia-northeast1/services?pageSize=50&pageToken=service-page",
      "access-token",
    );
  });

  it("creates job Console URLs from job metadata", async () => {
    fetchGoogleApiMock.mockResolvedValueOnce({
      metadata: { continue: "next-job-page" },
      items: [
        {
          metadata: {
            name: "daily-job",
            uid: "job-uid",
            generation: "1",
            labels: { "cloud.googleapis.com/location": "us-central1" },
          },
        },
      ],
    });

    await expect(
      listCloudRunJobsPage("sample-project", "access-token", { pageSize: 50, pageToken: "job-page" }),
    ).resolves.toMatchObject({
      nextPageToken: "next-job-page",
      deployments: [
        {
          id: "job-uid",
          name: "daily-job",
          region: "us-central1",
          deployType: "Jobs",
          url: "https://console.cloud.google.com/run/jobs/details/us-central1/daily-job?project=sample-project",
        },
      ],
    });
    expect(fetchGoogleApiMock).toHaveBeenCalledWith(
      "https://run.googleapis.com/apis/run.googleapis.com/v1/namespaces/sample-project/jobs?limit=50&continue=job-page",
      "access-token",
    );
  });

  it("creates worker pool Console URLs from worker pool metadata", async () => {
    fetchGoogleApiMock.mockResolvedValueOnce({
      metadata: { continue: "next-worker-page" },
      items: [
        {
          metadata: {
            name: "queue-worker",
            uid: "worker-uid",
            generation: "1",
            labels: { "cloud.googleapis.com/location": "europe-west1" },
          },
        },
      ],
    });

    await expect(
      listCloudRunWorkerPoolsPage("sample-project", "access-token", { pageSize: 50, pageToken: "worker-page" }),
    ).resolves.toMatchObject({
      nextPageToken: "next-worker-page",
      deployments: [
        {
          id: "worker-uid",
          name: "queue-worker",
          region: "europe-west1",
          deployType: "Worker Pools",
          url: "https://console.cloud.google.com/run/worker-pools/detail/europe-west1/queue-worker?project=sample-project",
        },
      ],
    });
    expect(fetchGoogleApiMock).toHaveBeenCalledWith(
      "https://run.googleapis.com/apis/run.googleapis.com/v1/namespaces/sample-project/workerpools?limit=50&continue=worker-page",
      "access-token",
    );
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchGoogleApi } from "../../auth/api";
import {
  listCloudRunJobsPage,
  listCloudRunGlobalServicesPage,
  listCloudRunLocationsPage,
  listCloudRunRegionalServicesPage,
  listCloudRunServicesPage,
  listCloudRunWorkerPoolsPage,
} from "./api";

vi.mock("../../auth/api", () => ({ fetchGoogleApi: vi.fn() }));

const fetchGoogleApiMock = vi.mocked(fetchGoogleApi);

describe("Cloud Run API", () => {
  beforeEach(() => fetchGoogleApiMock.mockReset());

  it("uses the v1 wildcard global listing without a resource limit and preserves continuation and warnings", async () => {
    fetchGoogleApiMock.mockResolvedValueOnce({
      items: [
        {
          metadata: {
            name: "journal",
            uid: "journal-id",
            labels: { "cloud.googleapis.com/location": "asia-northeast1" },
          },
        },
      ],
      metadata: { continue: "next+page/=" },
      unreachable: ["europe-west1"],
    });
    const controller = new AbortController();
    const page = await listCloudRunGlobalServicesPage("project", "token", {
      pageToken: "previous+page/=",
      signal: controller.signal,
    });
    const url = new URL(fetchGoogleApiMock.mock.calls[0][0]);
    expect(url.pathname).toBe("/v1/projects/project/locations/-/services");
    expect(url.searchParams.has("limit")).toBe(false);
    expect(url.searchParams.has("pageSize")).toBe(false);
    expect(url.searchParams.get("continue")).toBe("previous+page/=");
    expect(url.searchParams.get("fields")).toContain("metadata(continue),unreachable");
    expect(fetchGoogleApiMock.mock.calls[0][2]?.signal).toBe(controller.signal);
    expect(page).toMatchObject({
      deployments: [{ name: "journal", region: "asia-northeast1" }],
      nextPageToken: "next+page/=",
      unreachable: ["europe-west1"],
    });
  });

  it.each(["global", "regional", "locations"])("passes cancellation to %s requests", async (kind) => {
    fetchGoogleApiMock.mockResolvedValueOnce({});
    const controller = new AbortController();
    const options = { pageSize: 500, signal: controller.signal };
    if (kind === "global") await listCloudRunServicesPage("project", "token", options);
    if (kind === "regional") await listCloudRunRegionalServicesPage("project", "asia-northeast1", "token", options);
    if (kind === "locations") await listCloudRunLocationsPage("project", "token", options);
    expect(fetchGoogleApiMock.mock.calls[0][2]?.signal).toBe(controller.signal);
  });

  it("discovers project regions without dropping the locations pagination token", async () => {
    fetchGoogleApiMock.mockResolvedValueOnce({
      locations: ["us-central1", "asia-northeast1", "us-central1", "global"].map((locationId) => ({ locationId })),
      nextPageToken: "next-locations",
    });
    await expect(
      listCloudRunLocationsPage("sample-project", "access-token", { pageSize: 50, pageToken: "a+b/=" }),
    ).resolves.toEqual({
      regions: ["asia-northeast1", "us-central1"],
      nextPageToken: "next-locations",
    });
    expect(fetchGoogleApiMock).toHaveBeenCalledWith(
      "https://run.googleapis.com/v1/projects/sample-project/locations?pageSize=50&pageToken=a%2Bb%2F%3D",
      "access-token",
      undefined,
    );
  });

  it("pages regional v2 services and preserves service names, URLs, and function classification", async () => {
    fetchGoogleApiMock.mockResolvedValueOnce({
      services: [
        {
          name: "projects/sample-project/locations/asia-northeast1/services/journal",
          uid: "journal-id",
          uri: "https://journal.example.com",
        },
        {
          name: "projects/sample-project/locations/asia-northeast1/services/handler",
          buildConfig: { functionTarget: "handleRequest" },
        },
        { name: "projects/sample-project/locations/asia-northeast1/services/default-target", buildConfig: {} },
        {
          name: "projects/sample-project/locations/asia-northeast1/services/managed-function",
          labels: { "goog-managed-by": "cloudfunctions" },
        },
      ],
      nextPageToken: "next-services",
    });
    const page = await listCloudRunRegionalServicesPage("sample-project", "asia-northeast1", "access-token", {
      pageSize: 50,
      pageToken: "a+b/=",
    });
    expect(page.nextPageToken).toBe("next-services");
    expect(page.deployments[0]).toMatchObject({
      id: "journal-id",
      name: "journal",
      region: "asia-northeast1",
      deployType: "Container Services",
      uri: "https://journal.example.com",
      url: "https://console.cloud.google.com/run/detail/asia-northeast1/journal?project=sample-project",
    });
    expect(page.deployments[1]).toMatchObject({
      id: "projects/sample-project/locations/asia-northeast1/services/handler",
      deployType: "Function Services",
      kind: "cloud-run-service",
    });
    expect(page.deployments.slice(2).map(({ deployType }) => deployType)).toEqual([
      "Function Services",
      "Function Services",
    ]);
    expect(fetchGoogleApiMock).toHaveBeenCalledWith(
      "https://run.googleapis.com/v2/projects/sample-project/locations/asia-northeast1/services?pageSize=50&fields=services%28name%2Cuid%2Curi%2Clabels%2CbuildConfig%29%2CnextPageToken&pageToken=a%2Bb%2F%3D",
      "access-token",
      undefined,
    );
  });

  it("lists services globally and preserves their region, URL, and pagination token", async () => {
    fetchGoogleApiMock.mockResolvedValueOnce({
      metadata: { continue: "next-service-page" },
      items: [
        {
          metadata: {
            name: "api-service",
            uid: "service-uid",
            labels: { "cloud.googleapis.com/location": "asia-northeast1" },
          },
          status: { url: "https://api-service.example.com" },
        },
      ],
    });

    await expect(
      listCloudRunServicesPage("sample-project", "access-token", {
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
          uri: "https://api-service.example.com",
          url: "https://console.cloud.google.com/run/detail/asia-northeast1/api-service?project=sample-project",
        },
      ],
    });
    expect(fetchGoogleApiMock).toHaveBeenCalledWith(
      "https://run.googleapis.com/apis/serving.knative.dev/v1/namespaces/sample-project/services?limit=50&continue=service-page",
      "access-token",
      undefined,
    );
  });

  it("fetches only one page across regions and preserves partial results", async () => {
    fetchGoogleApiMock.mockResolvedValueOnce({
      items: ["us-central1", "europe-west1"].map((region) => ({
        metadata: { name: "same-name", uid: region, labels: { "cloud.googleapis.com/location": region } },
      })),
      metadata: { continue: "more" },
      unreachable: ["me-central2", "me-central2", ""],
    });
    const page = await listCloudRunServicesPage("sample-project", "access-token", { pageSize: 50 });
    expect(page.deployments.map(({ id, region }) => ({ id, region }))).toEqual([
      { id: "us-central1", region: "us-central1" },
      { id: "europe-west1", region: "europe-west1" },
    ]);
    expect(page.unreachable).toEqual(["me-central2"]);
    expect(page.nextPageToken).toBe("more");
    expect(fetchGoogleApiMock).toHaveBeenCalledExactlyOnceWith(
      "https://run.googleapis.com/apis/serving.knative.dev/v1/namespaces/sample-project/services?limit=50",
      "access-token",
      undefined,
    );
  });

  it.each(["run.googleapis.com/build-function-target", "run.googleapis.com/function-target"])(
    "recognizes function services via %s",
    async (annotation) => {
      fetchGoogleApiMock.mockResolvedValueOnce({
        items: [
          {
            metadata: {
              name: "handler",
              uid: "function-id",
              labels: { "cloud.googleapis.com/location": "us-central1" },
              annotations: { [annotation]: "handleRequest" },
            },
          },
        ],
      });
      const page = await listCloudRunServicesPage("sample-project", "access-token", { pageSize: 50 });
      expect(page.deployments[0]).toMatchObject({ deployType: "Function Services", kind: "cloud-run-service" });
      expect(page.deployments[0].uri).toBeUndefined();
    },
  );

  it("does not classify an ordinary source build as a function", async () => {
    fetchGoogleApiMock.mockResolvedValueOnce({
      items: [
        {
          metadata: {
            name: "web",
            uid: "web-id",
            labels: { "cloud.googleapis.com/location": "us-central1" },
            annotations: { "run.googleapis.com/build-source-location": "gs://sources/web" },
          },
        },
      ],
    });
    const page = await listCloudRunServicesPage("sample-project", "access-token", { pageSize: 50 });
    expect(page.deployments[0].deployType).toBe("Container Services");
  });

  it("returns an empty page with unreachable regions when no services were returned", async () => {
    fetchGoogleApiMock.mockResolvedValueOnce({ unreachable: ["me-central2"], metadata: { continue: "" } });
    await expect(listCloudRunServicesPage("sample-project", "access-token", { pageSize: 50 })).resolves.toEqual({
      deployments: [],
      nextPageToken: undefined,
      unreachable: ["me-central2"],
    });
  });

  it("handles an empty project", async () => {
    fetchGoogleApiMock.mockResolvedValueOnce({});
    await expect(listCloudRunServicesPage("sample-project", "access-token", { pageSize: 50 })).resolves.toEqual({
      deployments: [],
      nextPageToken: undefined,
      unreachable: [],
    });
  });

  it("encodes opaque continuation tokens", async () => {
    fetchGoogleApiMock.mockResolvedValueOnce({});
    await listCloudRunServicesPage("sample-project", "access-token", { pageSize: 50, pageToken: "a+b/=" });
    expect(fetchGoogleApiMock).toHaveBeenCalledWith(
      "https://run.googleapis.com/apis/serving.knative.dev/v1/namespaces/sample-project/services?limit=50&continue=a%2Bb%2F%3D",
      "access-token",
      undefined,
    );
  });

  it.each([401, 403, 404, 500])("propagates global request errors (%s)", async (status) => {
    const error = new Error(`Request failed (${status})`);
    fetchGoogleApiMock.mockRejectedValueOnce(error);
    await expect(listCloudRunServicesPage("sample-project", "access-token", { pageSize: 50 })).rejects.toBe(error);
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

import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchGoogleApi } from "../auth/api";
import { listWorkloadIdentityPoolsPage } from "./api";

vi.mock("../auth/api", () => ({
  fetchGoogleApi: vi.fn(),
}));

const fetchGoogleApiMock = vi.mocked(fetchGoogleApi);

describe("Workload Identity API", () => {
  beforeEach(() => {
    fetchGoogleApiMock.mockReset();
  });

  it("lists and maps a page of Workload Identity pools", async () => {
    fetchGoogleApiMock.mockResolvedValueOnce({
      nextPageToken: "next-pool-page",
      workloadIdentityPools: [
        {
          name: "projects/123456789/locations/global/workloadIdentityPools/github",
          displayName: "GitHub Actions",
          description: "Pool for CI workloads",
          state: "ACTIVE",
          disabled: false,
          mode: "FEDERATION_ONLY",
        },
        {
          name: "projects/123456789/locations/global/workloadIdentityPools/legacy",
          state: "ACTIVE",
          disabled: true,
        },
      ],
    });

    const page = await listWorkloadIdentityPoolsPage("sample-project", "access-token", {
      pageSize: 50,
      pageToken: "pool-page",
    });

    expect(fetchGoogleApiMock).toHaveBeenCalledWith(
      "https://iam.googleapis.com/v1/projects/sample-project/locations/global/workloadIdentityPools?pageSize=50&pageToken=pool-page",
      "access-token",
    );
    expect(page).toEqual({
      nextPageToken: "next-pool-page",
      pools: [
        {
          id: "github",
          name: "GitHub Actions",
          description: "Pool for CI workloads",
          state: "ACTIVE",
          disabled: false,
          mode: "FEDERATION_ONLY",
          url: "https://console.cloud.google.com/iam-admin/workload-identity-pools/pool/github?project=sample-project",
          keywords: ["github", "GitHub Actions", "Pool for CI workloads", "ACTIVE", "FEDERATION_ONLY"],
        },
        {
          id: "legacy",
          name: "legacy",
          description: undefined,
          state: "ACTIVE",
          disabled: true,
          mode: undefined,
          url: "https://console.cloud.google.com/iam-admin/workload-identity-pools/pool/legacy?project=sample-project",
          keywords: ["legacy", "legacy", "ACTIVE"],
        },
      ],
    });
  });

  it("returns an empty page when pools are absent", async () => {
    fetchGoogleApiMock.mockResolvedValueOnce({});

    await expect(listWorkloadIdentityPoolsPage("sample-project", "access-token", { pageSize: 50 })).resolves.toEqual({
      pools: [],
      nextPageToken: undefined,
    });
  });
});

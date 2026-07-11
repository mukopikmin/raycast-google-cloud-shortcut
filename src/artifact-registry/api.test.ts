import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchGoogleApi } from "../auth/api";
import { listArtifactRegistryRepositories } from "./api";

vi.mock("../auth/api", () => ({ fetchGoogleApi: vi.fn() }));

const fetchGoogleApiMock = vi.mocked(fetchGoogleApi);

describe("Artifact Registry API", () => {
  beforeEach(() => fetchGoogleApiMock.mockReset());

  it("creates Console URLs from repository resource names", async () => {
    fetchGoogleApiMock.mockResolvedValueOnce({
      repositories: [
        {
          name: "projects/sample-project/locations/us-central1/repositories/app-images",
          format: "DOCKER",
          description: "Container images",
        },
      ],
    });

    await expect(listArtifactRegistryRepositories("sample-project", "us-central1", "access-token")).resolves.toEqual([
      {
        name: "app-images",
        location: "us-central1",
        format: "DOCKER",
        description: "Container images",
        url: "https://console.cloud.google.com/artifacts/docker/sample-project/us-central1/app-images?project=sample-project",
      },
    ]);
    expect(fetchGoogleApiMock).toHaveBeenCalledWith(
      "https://artifactregistry.googleapis.com/v1/projects/sample-project/locations/us-central1/repositories",
      "access-token",
    );
  });
});

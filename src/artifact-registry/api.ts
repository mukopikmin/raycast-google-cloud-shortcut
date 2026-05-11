import { fetchGoogleApi } from "../auth/api";
import { Location } from "../region/types";
import { ArtifactRegistryRepository } from "./types";

type RepositoryResponse = {
  name: string;
  format: string;
  description: string;
};

type ListRepositoriesResponse = {
  repositories?: RepositoryResponse[];
};

/**
 * @see https://cloud.google.com/artifact-registry/docs/reference/rest/v1/projects.locations.repositories/list
 */
export const listArtifactRegistryRepositories = async (
  projectId: string,
  locationId: string,
  accessToken: string,
): Promise<ArtifactRegistryRepository[]> => {
  const body = await fetchGoogleApi<ListRepositoriesResponse>(
    `https://artifactregistry.googleapis.com/v1/projects/${projectId}/locations/${locationId}/repositories`,
    accessToken,
  );

  return (body.repositories ?? []).map((repo) => {
    // name format: projects/{project}/locations/{location}/repositories/{repo}
    const parts = repo.name.split("/");
    const loc = parts[3];
    const repoName = parts[5];

    return {
      name: repoName,
      location: loc,
      format: repo.format,
      description: repo.description,
      url: `https://console.cloud.google.com/artifacts/${repo.format.toLowerCase()}/${projectId}/${loc}/${repoName}?project=${projectId}`,
    };
  });
};

type ArtifactRegistryLocationsResponse = {
  locations?: {
    locationId: string;
    displayName?: string;
  }[];
};

/**
 * @see https://cloud.google.com/artifact-registry/docs/reference/rest/v1/projects.locations/list
 */
export const listArtifactRegistryLocations = async (projectId: string, accessToken: string): Promise<Location[]> => {
  const data = await fetchGoogleApi<ArtifactRegistryLocationsResponse>(
    `https://artifactregistry.googleapis.com/v1/projects/${projectId}/locations`,
    accessToken,
  );

  return (data.locations ?? [])
    .map((loc) => ({
      id: loc.locationId,
      name: loc.displayName || loc.locationId,
    }))
    .sort((a, b) => a.id.localeCompare(b.id));
};

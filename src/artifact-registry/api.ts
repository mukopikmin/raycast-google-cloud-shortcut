import { fetchGoogleApi } from "../auth/api";
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
  accessToken: string,
): Promise<ArtifactRegistryRepository[]> => {
  const body = await fetchGoogleApi<ListRepositoriesResponse>(
    `https://artifactregistry.googleapis.com/v1/projects/${projectId}/locations/-/repositories`,
    accessToken,
  );

  return (body.repositories ?? []).map((repo) => {
    // name format: projects/{project}/locations/{location}/repositories/{repo}
    const parts = repo.name.split("/");
    const location = parts[3];
    const repoName = parts[5];

    return {
      name: repoName,
      location,
      format: repo.format,
      description: repo.description,
      url: `https://console.cloud.google.com/artifacts/${repo.format.toLowerCase()}/${projectId}/${location}/${repoName}?project=${projectId}`,
    };
  });
};

import { usePromise } from "@raycast/utils";
import { useGoogleApi } from "../auth/google";
import { listArtifactRegistryRepositories } from "./api";
import { ArtifactRegistryRepository } from "./types";

type UseArtifactRegistryResult =
  | {
      repositories: ArtifactRegistryRepository[];
      isLoading: boolean;
      error: undefined;
    }
  | {
      repositories: undefined;
      isLoading: true;
      error: undefined;
    }
  | {
      repositories: undefined;
      isLoading: false;
      error: Error;
    };

export const useArtifactRegistry = (projectId: string, locationId: string): UseArtifactRegistryResult => {
  const { accessToken } = useGoogleApi();
  const { data, isLoading, error } = usePromise(
    async (projId: string, locId: string, token: string) => {
      return await listArtifactRegistryRepositories(projId, locId, token);
    },
    [projectId, locationId, accessToken],
  );

  if (error) {
    return { repositories: undefined, isLoading: false, error };
  }

  if (!data) {
    return { repositories: undefined, isLoading: true, error: undefined };
  }

  return { repositories: data, isLoading, error: undefined };
};

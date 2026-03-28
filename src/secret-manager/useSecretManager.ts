import { usePromise } from "@raycast/utils";
import { useGoogleApi } from "../auth/google";
import { listSecretManagerSecrets } from "./api";
import { SecretManagerSecret } from "./types";

type UseSecretManagerResult =
  | {
      secrets: SecretManagerSecret[];
      isLoading: boolean;
      error: undefined;
    }
  | {
      secrets: undefined;
      isLoading: true;
      error: undefined;
    }
  | {
      secrets: undefined;
      isLoading: false;
      error: Error;
    };

export const useSecretManager = (projectId: string): UseSecretManagerResult => {
  const { accessToken } = useGoogleApi();
  const { data, isLoading, error } = usePromise(
    async (projId: string, token: string) => {
      return await listSecretManagerSecrets(projId, token);
    },
    [projectId, accessToken],
  );

  if (error) {
    return { secrets: undefined, isLoading: false, error };
  }

  if (!data) {
    return { secrets: undefined, isLoading: true, error: undefined };
  }

  return { secrets: data, isLoading, error: undefined };
};

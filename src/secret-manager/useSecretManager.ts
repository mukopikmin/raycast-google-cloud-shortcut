import { useState } from "react";
import { usePromise } from "@raycast/utils";
import { useGoogleApi } from "../auth/google";
import { listSecretManagerSecrets } from "./api";
import { SecretManagerSecret } from "./types";

type SuccessResult = {
  secrets: SecretManagerSecret[];
  isLoading: boolean;
  error: undefined;
};

type LoadingResult = {
  secrets: undefined;
  isLoading: true;
  error: undefined;
};

type ErrorResult = {
  secrets: undefined;
  isLoading: false;
  error: Error;
};

type UseSecretManagerResult = SuccessResult | LoadingResult | ErrorResult;

export const useSecretManager = (projectId: string): UseSecretManagerResult => {
  const { accessToken } = useGoogleApi();
  const [progressiveSecrets, setProgressiveSecrets] = useState<SecretManagerSecret[]>([]);

  const { isLoading, error } = usePromise(
    async (projId: string, token: string) => {
      setProgressiveSecrets([]);
      return await listSecretManagerSecrets(projId, token, (secrets) => {
        setProgressiveSecrets([...secrets]);
      });
    },
    [projectId, accessToken],
  );

  if (error) {
    return { secrets: undefined, isLoading: false, error };
  }

  if (isLoading && progressiveSecrets.length === 0) {
    return { secrets: undefined, isLoading: true, error: undefined };
  }

  return { secrets: progressiveSecrets, isLoading, error: undefined };
};

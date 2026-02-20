import { useEffect, useState } from "react";
import { useGoogleApi } from "../auth/google";
import { listSecretManagerSecrets } from "./api";
import { SecretManagerSecret } from "./types";

type UseSecretManagerResult =
  | {
      secrets: SecretManagerSecret[];
      isLoading: false;
    }
  | {
      secrets: undefined;
      isLoading: true;
    };

export const useSecretManager = (projectId: string): UseSecretManagerResult => {
  const { accessToken } = useGoogleApi();
  const [secrets, setSecrets] = useState<SecretManagerSecret[] | undefined>();

  useEffect(() => {
    (async () => {
      const data = await listSecretManagerSecrets(projectId, accessToken);
      setSecrets(data);
    })();
  }, [projectId]);

  return secrets === undefined
    ? {
        secrets: undefined,
        isLoading: true,
      }
    : {
        secrets,
        isLoading: false,
      };
};

import { useEffect, useState } from "react";
import { useGoogleApi } from "../auth/google";
import { listSecretManagerSecrets, SecretManagerSecret } from "./secret-manager";

type UseSecretManagerResult =
  | {
      secrets: SecretManagerSecret[];
      isLoading: false;
      error: undefined;
    }
  | {
      secrets: undefined;
      isLoading: true;
      error: undefined;
    };

export const useSecretManager = (projectId: string): UseSecretManagerResult => {
  const { accessToken } = useGoogleApi();
  const [secrets, setSecrets] = useState<SecretManagerSecret[] | undefined>(undefined);

  useEffect(() => {
    const load = async () => {
      const fetchedSecrets = await listSecretManagerSecrets(projectId, accessToken);
      setSecrets(fetchedSecrets);
    };

    load();
  }, [projectId]);

  return secrets === undefined
    ? {
        secrets: undefined,
        isLoading: true,
        error: undefined,
      }
    : {
        secrets,
        isLoading: false,
        error: undefined,
      };
};

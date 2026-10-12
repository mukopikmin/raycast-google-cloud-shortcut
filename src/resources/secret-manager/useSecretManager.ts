import { useCallback } from "react";
import { useGoogleApi } from "../../auth/google";
import { usePaginatedResources } from "../../hooks/usePaginatedResources";
import { PageOptions } from "../../pagination/types";
import { listSecretManagerSecretsPage } from "./api";
import { SecretManagerSecret } from "./types";

const getResourceId = (item: SecretManagerSecret) => item.id;

export const useSecretManager = (projectId: string) => {
  const { accessToken } = useGoogleApi();
  const fetchPage = useCallback(
    async (options: PageOptions) => {
      const page = await listSecretManagerSecretsPage(projectId, accessToken, options);
      return { resources: page.secrets, nextPageToken: page.nextPageToken };
    },
    [projectId, accessToken],
  );
  const result = usePaginatedResources(fetchPage, getResourceId);
  return { ...result, secrets: result.resources };
};

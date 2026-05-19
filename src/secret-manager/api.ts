import { fetchGoogleApi } from "../auth/api";
import { SecretManagerSecret } from "./types";

type SecretManagerSecretsResponse = {
  secrets?: { name: string }[];
  nextPageToken?: string;
};

export type SecretManagerSecretsPage = {
  secrets: SecretManagerSecret[];
  nextPageToken?: string;
};

/**
 * @see https://docs.cloud.google.com/secret-manager/docs/reference/rest/v1beta1/projects.secrets/list
 */
export const listSecretManagerSecretsPage = async (
  projectId: string,
  accessToken: string,
  options: { pageSize: number; pageToken?: string },
): Promise<SecretManagerSecretsPage> => {
  const query = new URLSearchParams({
    pageSize: options.pageSize.toString(),
  });
  if (options.pageToken) {
    query.set("pageToken", options.pageToken);
  }

  const body = await fetchGoogleApi<SecretManagerSecretsResponse>(
    `https://secretmanager.googleapis.com/v1beta1/projects/${projectId}/secrets?${query.toString()}`,
    accessToken,
  );

  const secrets =
    body.secrets?.map((secret) => {
      // projects/{project}/secrets/{secretId}
      const parts = secret.name.split("/");
      const name = parts[parts.length - 1];

      return {
        id: secret.name,
        name: name,
        url: `https://console.cloud.google.com/security/secret-manager/secret/${name}?project=${projectId}`,
      };
    }) ?? [];

  return {
    secrets,
    nextPageToken: body.nextPageToken,
  };
};

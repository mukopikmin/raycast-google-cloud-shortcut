import { useGoogleApi } from "../auth/google";

export type SecretManagerSecret = {
  id: string;
  name: string;
  url: string;
};

type SecretManagerSecretsResponse = {
  secrets: { name: string }[];
};

/**
 * @see https://docs.cloud.google.com/secret-manager/docs/reference/rest/v1beta1/projects.secrets/list
 */
export const listSecretManagerSecrets = async (projectId: string): Promise<SecretManagerSecret[]> => {
  const googleApi = useGoogleApi();
  const response = await fetch(`https://secretmanager.googleapis.com/v1beta1/projects/${projectId}/secrets`, {
    headers: { Authorization: `Bearer ${googleApi.accessToken}` },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Secret Manager secrets: ${response.statusText}`);
  }

  const body = (await response.json()) as SecretManagerSecretsResponse;
  const secrets = body.secrets.map((secret) => {
    // projects/{project}/secrets/{secretId}
    const parts = secret.name.split("/");
    const name = parts[parts.length - 1];

    return {
      id: secret.name,
      name: name,
      url: `https://console.cloud.google.com/security/secret-manager/secrets/${name}?project=${projectId}`,
    };
  });

  return secrets;
};

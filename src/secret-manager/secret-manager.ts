import { fetchGoogleApi } from "../auth/api";

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
export const listSecretManagerSecrets = async (
  projectId: string,
  accessToken: string,
): Promise<SecretManagerSecret[]> => {
  const body = await fetchGoogleApi<SecretManagerSecretsResponse>(
    `https://secretmanager.googleapis.com/v1beta1/projects/${projectId}/secrets`,
    accessToken,
  );
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

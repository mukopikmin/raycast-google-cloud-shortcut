import { fetchGoogleApi } from "../auth/api";
import { SecretManagerSecret } from "./types";

type SecretManagerSecretsResponse = {
  secrets?: { name: string }[];
  nextPageToken?: string;
};

/**
 * @see https://docs.cloud.google.com/secret-manager/docs/reference/rest/v1beta1/projects.secrets/list
 */
export const listSecretManagerSecrets = async (
  projectId: string,
  accessToken: string,
  onPageFetched?: (secrets: SecretManagerSecret[]) => void,
): Promise<SecretManagerSecret[]> => {
  const allSecrets: SecretManagerSecret[] = [];
  let pageToken: string | undefined;

  do {
    const query = new URLSearchParams();
    if (pageToken) {
      query.set("pageToken", pageToken);
    }

    const suffix = query.toString();
    const body = await fetchGoogleApi<SecretManagerSecretsResponse>(
      `https://secretmanager.googleapis.com/v1beta1/projects/${projectId}/secrets${suffix ? `?${suffix}` : ""}`,
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

    allSecrets.push(...secrets);
    onPageFetched?.(allSecrets);

    pageToken = body.nextPageToken;
  } while (pageToken);

  return allSecrets;
};

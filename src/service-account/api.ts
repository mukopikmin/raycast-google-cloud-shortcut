import { fetchGoogleApi } from "../auth/api";
import { ServiceAccount, ServiceAccountListResponse } from "./types";

export const fetchServiceAccounts = async (projectId: string, accessToken: string): Promise<ServiceAccount[]> => {
  const data = await fetchGoogleApi<ServiceAccountListResponse>(
    `https://iam.googleapis.com/v1/projects/${projectId}/serviceAccounts`,
    accessToken,
  );

  return data.accounts.map((account) => {
    return {
      id: account.uniqueId,
      name: account.displayName,
      email: account.email,
      url: `https://console.cloud.google.com/iam-admin/serviceaccounts/details/${account.uniqueId}?project=${projectId}`,
    };
  });
};

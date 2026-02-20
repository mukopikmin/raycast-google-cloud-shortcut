import { fetchGoogleApi } from "../auth/api";

export type ServiceAccount = {
  id: string;
  name: string;
  email: string;
  url: string;
};

type ServiceAccountListResponse = {
  accounts: {
    uniqueId: string;
    displayName: string;
    email: string;
  }[];
};

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

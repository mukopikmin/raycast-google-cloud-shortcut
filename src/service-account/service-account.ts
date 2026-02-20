import { useGoogleApi } from "../auth/google";

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

export const fetchServiceAccounts = async (projectId: string): Promise<ServiceAccount[]> => {
  const googleApi = useGoogleApi();
  const response = await fetch(`https://iam.googleapis.com/v1/projects/${projectId}/serviceAccounts`, {
    headers: { Authorization: `Bearer ${googleApi.accessToken}` },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch service accounts: ${response.statusText}`);
  }

  const body = (await response.json()) as ServiceAccountListResponse;
  const serviceAccounts = body.accounts.map((account) => {
    return {
      id: account.uniqueId,
      name: account.displayName,
      email: account.email,
      url: `https://console.cloud.google.com/iam-admin/serviceaccounts/details/${account.uniqueId}?project=${projectId}`,
    };
  });

  return serviceAccounts;
};

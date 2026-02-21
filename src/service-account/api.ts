import { fetchGoogleApi } from "../auth/api";
import { createServiceAccount, ServiceAccount } from "./types";

type ServiceAccountListResponse = {
  accounts?: {
    uniqueId: string;
    displayName: string;
    email: string;
  }[];
};

export const fetchServiceAccounts = async (
  projectId: string,
  accessToken: string,
): Promise<ServiceAccount[]> => {
  const data = await fetchGoogleApi<ServiceAccountListResponse>(
    `https://iam.googleapis.com/v1/projects/${projectId}/serviceAccounts`,
    accessToken,
  );

  return data.accounts?.map((account) => {
    return createServiceAccount({
      id: account.uniqueId,
      name: account.displayName,
      email: account.email,
      projectId,
    });
  }) ?? [];
};

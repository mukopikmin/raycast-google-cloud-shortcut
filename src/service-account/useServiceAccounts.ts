import { usePromise } from "@raycast/utils";
import { ServiceAccount } from "./types";
import { fetchServiceAccounts } from "./api";
import { useGoogleApi } from "../auth/google";

type UseServiceAccountResult =
  | {
      serviceAccounts: ServiceAccount[];
      isLoading: boolean;
      error: undefined;
    }
  | {
      serviceAccounts: undefined;
      isLoading: true;
      error: undefined;
    }
  | {
      serviceAccounts: undefined;
      isLoading: false;
      error: Error;
    };

export const useServiceAccounts = (projectId: string): UseServiceAccountResult => {
  const { accessToken } = useGoogleApi();
  const { data, isLoading, error } = usePromise(
    async (projId: string, token: string) => {
      return await fetchServiceAccounts(projId, token);
    },
    [projectId, accessToken],
  );

  if (error) {
    return { serviceAccounts: undefined, isLoading: false, error };
  }

  if (!data) {
    return { serviceAccounts: undefined, isLoading: true, error: undefined };
  }

  return { serviceAccounts: data, isLoading, error: undefined };
};

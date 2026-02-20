import { useEffect, useState } from "react";
import { ServiceAccount } from "./types";
import { fetchServiceAccounts } from "./api";
import { useGoogleApi } from "../auth/google";

type UseServiceAccountResult =
  | {
    serviceAccounts: ServiceAccount[];
    isLoading: false;
  }
  | {
    serviceAccounts: undefined;
    isLoading: true;
  };

export const useServiceAccounts = (
  projectId: string,
): UseServiceAccountResult => {
  const { accessToken } = useGoogleApi();
  const [serviceAccounts, setServiceAccounts] = useState<
    ServiceAccount[] | undefined
  >();

  useEffect(() => {
    (async () => {
      const data = await fetchServiceAccounts(projectId, accessToken);
      setServiceAccounts(data);
    })();
  }, [projectId]);

  return serviceAccounts === undefined
    ? {
      serviceAccounts: undefined,
      isLoading: true,
    }
    : {
      serviceAccounts,
      isLoading: false,
    };
};

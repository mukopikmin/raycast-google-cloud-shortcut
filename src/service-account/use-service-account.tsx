import { useEffect, useState } from "react";
import { fetchServiceAccounts, ServiceAccount } from "./service-account";

type UseServiceAccountResult =
  | {
      serviceAccounts: ServiceAccount[];
      isLoading: false;
    }
  | {
      serviceAccounts: undefined;
      isLoading: true;
    };

export const useServiceAccount = (projectId: string): UseServiceAccountResult => {
  const [serviceAccounts, setServiceAccounts] = useState<ServiceAccount[] | undefined>(undefined);

  useEffect(() => {
    const load = async () => {
      const fetchedServiceAccounts = await fetchServiceAccounts(projectId);
      setServiceAccounts(fetchedServiceAccounts);
    };

    load();
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

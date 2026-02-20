import { useEffect, useState } from "react";
import { useGoogleApi } from "../auth/google";
import { listCloudSqlInstances } from "./api";
import { CloudSqlInstance } from "./types";

type UseCloudSqlInstancesResult =
  | {
      cloudSqlInstances: CloudSqlInstance[];
      isLoading: false;
      error: undefined;
    }
  | {
      cloudSqlInstances: undefined;
      isLoading: true;
      error: undefined;
    };

export const useCloudSqlInstances = (projectId: string): UseCloudSqlInstancesResult => {
  const { accessToken } = useGoogleApi();
  const [cloudSqlInstances, setCloudSqlInstances] = useState<CloudSqlInstance[] | undefined>(undefined);

  useEffect(() => {
    const load = async () => {
      const fetchedInstances = await listCloudSqlInstances(projectId, accessToken);
      setCloudSqlInstances(fetchedInstances);
    };

    load();
  }, [projectId]);

  return cloudSqlInstances === undefined
    ? {
        cloudSqlInstances: undefined,
        isLoading: true,
        error: undefined,
      }
    : {
        cloudSqlInstances,
        isLoading: false,
        error: undefined,
      };
};

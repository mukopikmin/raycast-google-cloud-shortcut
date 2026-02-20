import { useEffect, useState } from "react";
import { useGoogleApi } from "../auth/google";
import { listCloudSqlInstances } from "./api";
import { CloudSqlInstance } from "./types";

type UseCloudSqlInstancesResult =
  | {
      cloudSqlInstances: CloudSqlInstance[];
      isLoading: false;
    }
  | {
      cloudSqlInstances: undefined;
      isLoading: true;
    };

export const useCloudSqlInstances = (projectId: string): UseCloudSqlInstancesResult => {
  const { accessToken } = useGoogleApi();
  const [cloudSqlInstances, setCloudSqlInstances] = useState<CloudSqlInstance[] | undefined>();

  useEffect(() => {
    (async () => {
      const data = await listCloudSqlInstances(projectId, accessToken);
      setCloudSqlInstances(data);
    })();
  }, [projectId]);

  return cloudSqlInstances === undefined
    ? {
        cloudSqlInstances: undefined,
        isLoading: true,
      }
    : {
        cloudSqlInstances,
        isLoading: false,
      };
};

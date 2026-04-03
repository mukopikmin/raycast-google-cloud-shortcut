import { usePromise } from "@raycast/utils";
import { useGoogleApi } from "../auth/google";
import { listCloudSqlInstances } from "./api";
import { CloudSqlInstance } from "./types";

type UseCloudSqlInstancesResult =
  | {
      cloudSqlInstances: CloudSqlInstance[];
      isLoading: boolean;
      error: undefined;
    }
  | {
      cloudSqlInstances: undefined;
      isLoading: true;
      error: undefined;
    }
  | {
      cloudSqlInstances: undefined;
      isLoading: false;
      error: Error;
    };

export const useCloudSqlInstances = (projectId: string): UseCloudSqlInstancesResult => {
  const { accessToken } = useGoogleApi();
  const { data, isLoading, error } = usePromise(
    async (projId: string, token: string) => {
      return await listCloudSqlInstances(projId, token);
    },
    [projectId, accessToken],
  );

  if (error) {
    return { cloudSqlInstances: undefined, isLoading: false, error };
  }

  if (!data) {
    return { cloudSqlInstances: undefined, isLoading: true, error: undefined };
  }

  return { cloudSqlInstances: data, isLoading, error: undefined };
};

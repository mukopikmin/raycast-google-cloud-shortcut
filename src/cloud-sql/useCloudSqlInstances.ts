import { usePromise } from "@raycast/utils";
import { useGoogleApi } from "../auth/google";
import { listCloudSqlInstances } from "./api";
import { CloudSqlInstance } from "./types";

type SuccessResult = {
  cloudSqlInstances: CloudSqlInstance[];
  isLoading: boolean;
  error: undefined;
};

type LoadingResult = {
  cloudSqlInstances: undefined;
  isLoading: true;
  error: undefined;
};

type ErrorResult = {
  cloudSqlInstances: undefined;
  isLoading: false;
  error: Error;
};

type UseCloudSqlInstancesResult = SuccessResult | LoadingResult | ErrorResult;

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

import { usePromise } from "@raycast/utils";
import { useGoogleApi } from "../auth/google";
import { listCloudRunWorkerPools } from "./api";
import { CloudRunDeployment } from "./types";

type SuccessResult = {
  workerPools: CloudRunDeployment[];
  isLoading: boolean;
  error: undefined;
};

type LoadingResult = {
  workerPools: undefined;
  isLoading: true;
  error: undefined;
};

type ErrorResult = {
  workerPools: undefined;
  isLoading: false;
  error: Error;
};

type UseCloudRunWorkerPoolsResult = SuccessResult | LoadingResult | ErrorResult;

export const useCloudRunWorkerPools = (projectId: string): UseCloudRunWorkerPoolsResult => {
  const { accessToken } = useGoogleApi();
  const { data, isLoading, error } = usePromise(
    async (projId: string, token: string) => {
      return await listCloudRunWorkerPools(projId, token);
    },
    [projectId, accessToken],
  );

  if (error) {
    return { workerPools: undefined, isLoading: false, error };
  }

  if (!data) {
    return { workerPools: undefined, isLoading: true, error: undefined };
  }

  return { workerPools: data, isLoading, error: undefined };
};

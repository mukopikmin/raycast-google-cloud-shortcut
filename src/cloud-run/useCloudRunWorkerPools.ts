import { usePromise } from "@raycast/utils";
import { useGoogleApi } from "../auth/google";
import { listCloudRunWorkerPools } from "./api";
import { CloudRunDeployment } from "./types";

type UseCloudRunWorkerPoolsResult =
  | {
      workerPools: CloudRunDeployment[];
      isLoading: boolean;
      error: undefined;
    }
  | {
      workerPools: undefined;
      isLoading: true;
      error: undefined;
    }
  | {
      workerPools: undefined;
      isLoading: false;
      error: Error;
    };

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

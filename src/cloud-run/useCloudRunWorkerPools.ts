import { useEffect, useState } from "react";
import { useGoogleApi } from "../auth/google";
import { CloudRunDeployment } from "./types";
import { listCloudRunWorkerPools } from "./api";

type UseCloudRunWorkerPoolsResult =
  | {
      workerPools: CloudRunDeployment[];
      isLoading: false;
    }
  | {
      workerPools: undefined;
      isLoading: true;
    };

export const useCloudRunWorkerPools = (projectId: string): UseCloudRunWorkerPoolsResult => {
  const { accessToken } = useGoogleApi();
  const [workerPools, setWorkerPools] = useState<CloudRunDeployment[] | undefined>();

  useEffect(() => {
    (async () => {
      const data = await listCloudRunWorkerPools(projectId, accessToken);
      setWorkerPools(data);
    })();
  }, [projectId]);

  return workerPools === undefined
    ? {
        workerPools: undefined,
        isLoading: true,
      }
    : {
        workerPools,
        isLoading: false,
      };
};

import { CloudRunDeployment } from "./types";
import { useCloudRunJobs } from "./useCloudRunJobs";
import { useCloudRunServices } from "./useCloudRunServices";
import { useCloudRunWorkerPools } from "./useCloudRunWorkerPools";

type UseCloudRunDeploymentsResult =
  | {
      deployments: CloudRunDeployment[];
      isLoading: boolean;
      error: undefined;
    }
  | {
      deployments: undefined;
      isLoading: true;
      error: undefined;
    }
  | {
      deployments: undefined;
      isLoading: false;
      error: Error;
    };

export const useCloudRunDeployments = (projectId: string): UseCloudRunDeploymentsResult => {
  const { services, isLoading: isLoadingServices, error: errorServices } = useCloudRunServices(projectId);
  const { jobs, isLoading: isLoadingJobs, error: errorJobs } = useCloudRunJobs(projectId);
  const { workerPools, isLoading: isLoadingWorkerPools, error: errorWorkerPools } = useCloudRunWorkerPools(projectId);

  const error = errorServices || errorJobs || errorWorkerPools;

  if (error) {
    return { deployments: undefined, isLoading: false, error };
  }

  const isLoading = isLoadingServices || isLoadingJobs || isLoadingWorkerPools;

  if (isLoading || !services || !jobs || !workerPools) {
    return { deployments: undefined, isLoading: true, error: undefined };
  }

  return { deployments: [...services, ...jobs, ...workerPools], isLoading: false, error: undefined };
};

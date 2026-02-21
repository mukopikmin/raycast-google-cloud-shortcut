import { CloudRunDeployment } from "./types";
import { useCloudRunJobs } from "./useCloudRunJobs";
import { useCloudRunServices } from "./useCloudRunServices";
import { useCloudRunWorkerPools } from "./useCloudRunWorkerPools";

type UseCloudRunDeploymentsResult =
    | {
        deployments: CloudRunDeployment[];
        isLoading: false;
    }
    | {
        deployments: undefined;
        isLoading: true;
    };

export const useCloudRunDeployments = (
    projectId: string,
): UseCloudRunDeploymentsResult => {
    const { services, isLoading: isLoadingServices } = useCloudRunServices(
        projectId,
    );
    const { jobs, isLoading: isLoadingJobs } = useCloudRunJobs(projectId);
    const { workerPools, isLoading: isLoadingWorkerPools } =
        useCloudRunWorkerPools(projectId);

    return isLoadingServices || isLoadingJobs || isLoadingWorkerPools
        ? {
            deployments: undefined,
            isLoading: true,
        }
        : {
            deployments: [...services, ...jobs, ...workerPools],
            isLoading: false,
        };
};

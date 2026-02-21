import { CloudRunDeployment } from "./types";
import { useCloudRunJobs } from "./useCloudRunJobs";
import { useCloudRunServices } from "./useCloudRunServices";

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

    return isLoadingServices || isLoadingJobs
        ? {
            deployments: undefined,
            isLoading: true,
        }
        : {
            deployments: [...services, ...jobs],
            isLoading: false,
        };
};

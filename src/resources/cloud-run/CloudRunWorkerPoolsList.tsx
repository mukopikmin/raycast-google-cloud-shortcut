import { withGoogleAccessToken } from "../../auth/google";
import { CloudRunDeploymentList } from "./CloudRunDeploymentList";
import { useCloudRunWorkerPools } from "./useCloudRunWorkerPools";

type Props = { projectId: string };

const CloudRunWorkerPoolsListComponent = ({ projectId }: Props) => {
  const { workerPools, ...result } = useCloudRunWorkerPools(projectId);

  return <CloudRunDeploymentList {...result} deployments={workerPools} resourceName="Worker Pools" />;
};

export const CloudRunWorkerPoolsList = withGoogleAccessToken(CloudRunWorkerPoolsListComponent);

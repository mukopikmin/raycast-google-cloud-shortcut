import { useState } from "react";
import { withGoogleAccessToken } from "../../auth/google";
import { CloudRunDeploymentList } from "./CloudRunDeploymentList";
import { useCloudRunWorkerPools } from "./useCloudRunWorkerPools";

type Props = { projectId: string };

const CloudRunWorkerPoolsListComponent = ({ projectId }: Props) => {
  const [searchText, setSearchText] = useState("");
  const { workerPools, ...result } = useCloudRunWorkerPools(projectId, searchText);

  return (
    <CloudRunDeploymentList
      searchText={searchText}
      onSearchTextChange={setSearchText}
      {...result}
      deployments={workerPools}
      resourceName="Worker Pools"
    />
  );
};

export const CloudRunWorkerPoolsList = withGoogleAccessToken(CloudRunWorkerPoolsListComponent);

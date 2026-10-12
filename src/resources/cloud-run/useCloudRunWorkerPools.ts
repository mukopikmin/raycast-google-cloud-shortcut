import { useCallback } from "react";
import { useGoogleApi } from "../../auth/google";
import { usePaginatedResources } from "../../hooks/usePaginatedResources";
import { PageOptions } from "../../pagination/types";
import { listCloudRunWorkerPoolsPage } from "./api";
import { CloudRunDeployment } from "./types";

const getResourceId = (item: CloudRunDeployment) => item.id;

export const useCloudRunWorkerPools = (projectId: string) => {
  const { accessToken } = useGoogleApi();
  const fetchPage = useCallback(
    async (options: PageOptions) => {
      const page = await listCloudRunWorkerPoolsPage(projectId, accessToken, options);
      return { resources: page.deployments, nextPageToken: page.nextPageToken };
    },
    [projectId, accessToken],
  );
  const result = usePaginatedResources(fetchPage, getResourceId);
  return { ...result, workerPools: result.resources };
};

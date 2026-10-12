import { useCallback } from "react";
import { useGoogleApi } from "../../auth/google";
import { usePaginatedResources } from "../../hooks/usePaginatedResources";
import { PageOptions } from "../../pagination/types";
import { listComputeEngineInstancesPage } from "./api";
import { ComputeEngineInstance } from "./types";

const getResourceId = (item: ComputeEngineInstance) => item.id;

export const useComputeEngineInstances = (projectId: string) => {
  const { accessToken } = useGoogleApi();
  const fetchPage = useCallback(
    async (options: PageOptions) => {
      const page = await listComputeEngineInstancesPage(projectId, accessToken, options);
      return { resources: page.instances, nextPageToken: page.nextPageToken };
    },
    [projectId, accessToken],
  );
  const result = usePaginatedResources(fetchPage, getResourceId);
  return { ...result, instances: result.resources };
};

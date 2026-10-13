import { useCallback } from "react";
import { useGoogleApi } from "../../auth/google";
import { usePaginatedResources } from "../../hooks/usePaginatedResources";
import { PageOptions } from "../../pagination/types";
import { listComputeEngineInstancesPage } from "./api";
import { ComputeEngineInstance } from "./types";

const getResourceId = (item: ComputeEngineInstance) => item.id;
const getSearchText = (item: ComputeEngineInstance) =>
  [item.name, item.id, item.zone, item.machineType, item.status, item.internalIp, item.externalIp]
    .filter(Boolean)
    .join(" ");

export const useComputeEngineInstances = (projectId: string, searchText = "") => {
  const { accessToken } = useGoogleApi();
  const fetchPage = useCallback(
    async (options: PageOptions) => {
      const page = await listComputeEngineInstancesPage(projectId, accessToken, options);
      return { resources: page.instances, nextPageToken: page.nextPageToken };
    },
    [projectId, accessToken],
  );
  const result = usePaginatedResources(fetchPage, getResourceId, getSearchText, searchText);
  return { ...result, instances: result.resources };
};

import { useCallback } from "react";
import { useGoogleApi } from "../auth/google";
import { usePaginatedResources } from "../hooks/usePaginatedResources";
import { PageOptions } from "../pagination/types";
import { listWorkloadIdentityPoolsPage } from "./api";
import { WorkloadIdentityPool } from "./types";

const getResourceId = (item: WorkloadIdentityPool) => item.id;

export const useWorkloadIdentityPools = (projectId: string) => {
  const { accessToken } = useGoogleApi();
  const fetchPage = useCallback(
    async (options: PageOptions) => {
      const page = await listWorkloadIdentityPoolsPage(projectId, accessToken, options);
      return { resources: page.pools, nextPageToken: page.nextPageToken };
    },
    [projectId, accessToken],
  );
  const result = usePaginatedResources(fetchPage, getResourceId);
  return { ...result, pools: result.resources };
};

import { useCallback } from "react";
import { useGoogleApi } from "../../auth/google";
import { usePaginatedResources } from "../../hooks/usePaginatedResources";
import { PageOptions } from "../../pagination/types";
import { listKubernetesEngineClustersPage } from "./api";
import { KubernetesEngineCluster } from "./types";

const getResourceId = (item: KubernetesEngineCluster) => item.id;

export const useKubernetesEngineClusters = (projectId: string) => {
  const { accessToken } = useGoogleApi();
  const fetchPage = useCallback(
    async (options: PageOptions) => {
      const page = await listKubernetesEngineClustersPage(projectId, accessToken, options);
      return { resources: page.clusters, nextPageToken: page.nextPageToken };
    },
    [projectId, accessToken],
  );
  const result = usePaginatedResources(fetchPage, getResourceId);
  return { ...result, clusters: result.resources };
};

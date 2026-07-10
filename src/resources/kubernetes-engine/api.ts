import { fetchGoogleApi } from "../../auth/api";
import { KubernetesEngineCluster, KubernetesEngineClustersResponse } from "./types";

export type KubernetesEngineClustersPage = {
  clusters: KubernetesEngineCluster[];
  nextPageToken?: string;
};

/**
 * @see https://cloud.google.com/kubernetes-engine/docs/reference/rest/v1/projects.locations.clusters/list
 */
export const listKubernetesEngineClustersPage = async (
  projectId: string,
  accessToken: string,
  options: { pageSize: number; pageToken?: string },
): Promise<KubernetesEngineClustersPage> => {
  const query = new URLSearchParams({
    pageSize: options.pageSize.toString(),
  });
  if (options.pageToken) {
    query.set("pageToken", options.pageToken);
  }

  const body = await fetchGoogleApi<KubernetesEngineClustersResponse>(
    `https://container.googleapis.com/v1/projects/${projectId}/locations/-/clusters?${query.toString()}`,
    accessToken,
  );

  return {
    clusters:
      body.clusters?.map((cluster) => ({
        id: cluster.id,
        name: cluster.name,
        location: cluster.location,
        status: cluster.status,
        endpoint: cluster.endpoint,
        version: cluster.currentMasterVersion,
        nodeCount: cluster.currentNodeCount,
        projectId,
      })) ?? [],
    nextPageToken: body.nextPageToken,
  };
};

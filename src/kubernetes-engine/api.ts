import { fetchGoogleApi } from "../auth/api";
import { KubernetesEngineCluster, KubernetesEngineClustersResponse } from "./types";

/**
 * @see https://cloud.google.com/kubernetes-engine/docs/reference/rest/v1/projects.locations.clusters/list
 */
export const listKubernetesEngineClusters = async (
  projectId: string,
  accessToken: string,
  onPageFetched?: (clusters: KubernetesEngineCluster[]) => void,
): Promise<KubernetesEngineCluster[]> => {
  const allClusters: KubernetesEngineCluster[] = [];
  let pageToken: string | undefined;

  do {
    const query = new URLSearchParams();
    if (pageToken) {
      query.set("pageToken", pageToken);
    }

    const suffix = query.toString();
    const body = await fetchGoogleApi<KubernetesEngineClustersResponse>(
      `https://container.googleapis.com/v1/projects/${projectId}/locations/-/clusters${suffix ? `?${suffix}` : ""}`,
      accessToken,
    );

    const clusters =
      body.clusters?.map((cluster) => ({
        id: cluster.id,
        name: cluster.name,
        location: cluster.location,
        status: cluster.status,
        endpoint: cluster.endpoint,
        version: cluster.currentMasterVersion,
        nodeCount: cluster.currentNodeCount,
        projectId,
      })) ?? [];

    allClusters.push(...clusters);
    onPageFetched?.(allClusters);

    pageToken = body.nextPageToken;
  } while (pageToken);

  return allClusters;
};

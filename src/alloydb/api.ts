import { fetchGoogleApi } from "../auth/api";
import { AlloyDbCluster } from "./types";

type AlloyDbClustersResponse = {
  clusters?: {
    uid: string;
    name: string;
    displayName: string;
    state: string;
  }[];
};

/**
 * @see https://docs.cloud.google.com/alloydb/docs/reference/rest/v1beta/projects.locations.clusters/list
 */
export const listAlloyDbClusters = async (projectId: string, accessToken: string): Promise<AlloyDbCluster[]> => {
  const body = await fetchGoogleApi<AlloyDbClustersResponse>(
    `https://alloydb.googleapis.com/v1/projects/${projectId}/locations/-/clusters`,
    accessToken,
  );
  const clusters =
    body.clusters?.map((cluster) => {
      // projects/{project}/locations/{region}/clusters/{clusterId}
      const parts = cluster.name.split("/");
      const clusterId = parts[parts.length - 1];
      const region = parts[parts.length - 3];

      return {
        id: cluster.uid,
        clusterId,
        name: cluster.displayName || clusterId,
        displayName: cluster.displayName,
        region,
        state: cluster.state,
        url: `https://console.cloud.google.com/alloydb/clusters/${region}/${clusterId}?project=${projectId}`,
      };
    }) ?? [];

  return clusters;
};

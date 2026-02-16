import { useGoogleApi } from "../auth/google";

export type AlloyDbCluster = {
  id: string;
  name: string;
  region: string;
  state: string;
};

type AlloyDbClustersResponse = {
  clusters: {
    uid: string;
    name: string;
    displayName: string;
    state: string;
  }[];
};

/**
 * @see https://docs.cloud.google.com/alloydb/docs/reference/rest/v1beta/projects.locations.clusters/list
 */
export const listAlloyDbClusters = async (projectId: string): Promise<AlloyDbCluster[]> => {
  const googleApi = useGoogleApi();
  const response = await fetch(`https://alloydb.googleapis.com/v1/projects/${projectId}/locations/-/clusters`, {
    headers: { Authorization: `Bearer ${googleApi.accessToken}` },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch AlloyDB clusters: ${response.statusText}`);
  }

  const body = (await response.json()) as AlloyDbClustersResponse;
  const clusters = body.clusters.map((cluster) => {
    // projects/{project}/locations/{region}/clusters/{clusterId}
    const parts = cluster.name.split("/");
    const region = parts[parts.length - 3];

    return {
      id: cluster.uid,
      name: cluster.displayName,
      region,
      state: cluster.state,
    };
  });

  return clusters;
};

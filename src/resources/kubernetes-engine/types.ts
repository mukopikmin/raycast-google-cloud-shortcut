export type KubernetesEngineCluster = {
  id: string;
  name: string;
  location: string;
  status: string;
  endpoint?: string;
  version: string;
  nodeCount: number;
  projectId: string;
};

export type KubernetesEngineClustersResponse = {
  clusters?: {
    name: string;
    location: string;
    status: string;
    endpoint?: string;
    currentMasterVersion: string;
    currentNodeCount: number;
    id: string;
  }[];
  nextPageToken?: string;
};

export const createKubernetesEngineClusterUrl = (cluster: KubernetesEngineCluster): string => {
  return `https://console.cloud.google.com/kubernetes/clusters/details/${cluster.location}/${cluster.name}/details?project=${cluster.projectId}`;
};

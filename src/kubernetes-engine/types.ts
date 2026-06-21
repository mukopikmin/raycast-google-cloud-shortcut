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

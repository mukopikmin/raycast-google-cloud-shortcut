import { CloudLoggingTarget } from "../../actions/cloud-logging/types";

export type KubernetesEngineCluster = {
  id: string;
  status: string;
  endpoint?: string;
  version: string;
  nodeCount: number;
} & Extract<CloudLoggingTarget, { kind: "kubernetes-engine-cluster" }>;

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

export const createKubernetesEngineClusterUrl = <
  T extends Pick<KubernetesEngineCluster, "location" | "name" | "projectId">,
>(
  cluster: T,
): string => {
  return `https://console.cloud.google.com/kubernetes/clusters/details/${cluster.location}/${cluster.name}/details?project=${cluster.projectId}`;
};

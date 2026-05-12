import { useState } from "react";
import { usePromise } from "@raycast/utils";
import { useGoogleApi } from "../auth/google";
import { listKubernetesEngineClusters } from "./api";
import { KubernetesEngineCluster } from "./types";

type SuccessResult = {
  clusters: KubernetesEngineCluster[];
  isLoading: boolean;
  error: undefined;
};

type LoadingResult = {
  clusters: undefined;
  isLoading: true;
  error: undefined;
};

type ErrorResult = {
  clusters: undefined;
  isLoading: false;
  error: Error;
};

type UseKubernetesEngineClustersResult = SuccessResult | LoadingResult | ErrorResult;

export const useKubernetesEngineClusters = (projectId: string): UseKubernetesEngineClustersResult => {
  const { accessToken } = useGoogleApi();
  const [progressiveClusters, setProgressiveClusters] = useState<KubernetesEngineCluster[]>([]);

  const { isLoading, error } = usePromise(
    async (projId: string, token: string) => {
      setProgressiveClusters([]);
      return await listKubernetesEngineClusters(projId, token, (clusters) => {
        setProgressiveClusters([...clusters]);
      });
    },
    [projectId, accessToken],
  );

  if (error) {
    return { clusters: undefined, isLoading: false, error };
  }

  if (isLoading && progressiveClusters.length === 0) {
    return { clusters: undefined, isLoading: true, error: undefined };
  }

  return { clusters: progressiveClusters, isLoading, error: undefined };
};

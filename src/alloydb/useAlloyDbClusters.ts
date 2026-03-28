import { usePromise } from "@raycast/utils";
import { useGoogleApi } from "../auth/google";
import { listAlloyDbClusters } from "./api";
import { AlloyDbCluster } from "./types";

type UseAlloyDbClustersResult =
  | {
      clusters: AlloyDbCluster[];
      isLoading: boolean;
      error: undefined;
    }
  | {
      clusters: undefined;
      isLoading: true;
      error: undefined;
    }
  | {
      clusters: undefined;
      isLoading: false;
      error: Error;
    };

export const useAlloyDbClusters = (projectId: string): UseAlloyDbClustersResult => {
  const { accessToken } = useGoogleApi();
  const { data, isLoading, error } = usePromise(
    async (projId: string, token: string) => {
      return await listAlloyDbClusters(projId, token);
    },
    [projectId, accessToken],
  );

  if (error) {
    return { clusters: undefined, isLoading: false, error };
  }

  if (!data) {
    return { clusters: undefined, isLoading: true, error: undefined };
  }

  return { clusters: data, isLoading, error: undefined };
};

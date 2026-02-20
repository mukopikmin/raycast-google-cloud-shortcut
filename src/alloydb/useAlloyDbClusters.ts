import { useEffect, useState } from "react";
import { useGoogleApi } from "../auth/google";
import { listAlloyDbClusters } from "./api";
import { AlloyDbCluster } from "./types";

type UseAlloyDbClustersResult =
  | {
      clusters: AlloyDbCluster[];
      isLoading: false;
    }
  | {
      clusters: undefined;
      isLoading: true;
    };

export const useAlloyDbClusters = (projectId: string): UseAlloyDbClustersResult => {
  const { accessToken } = useGoogleApi();
  const [clusters, setClusters] = useState<AlloyDbCluster[] | undefined>();

  useEffect(() => {
    (async () => {
      const data = await listAlloyDbClusters(projectId, accessToken);
      setClusters(data);
    })();
  }, [projectId]);

  return clusters === undefined
    ? {
        clusters: undefined,
        isLoading: true,
      }
    : {
        clusters,
        isLoading: false,
      };
};

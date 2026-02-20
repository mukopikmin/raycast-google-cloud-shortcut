import { useEffect, useState } from "react";
import { useGoogleApi } from "../auth/google";
import { AlloyDbCluster, listAlloyDbClusters } from "./alloydb";

type UseAlloyDbResult =
  | {
      clusters: AlloyDbCluster[];
      isLoading: false;
      error: undefined;
    }
  | {
      clusters: undefined;
      isLoading: true;
      error: undefined;
    };

export const useAlloyDb = (projectId: string): UseAlloyDbResult => {
  const { accessToken } = useGoogleApi();
  const [clusters, setClusters] = useState<AlloyDbCluster[] | undefined>(undefined);

  useEffect(() => {
    const load = async () => {
      const fetchedClusters = await listAlloyDbClusters(projectId, accessToken);
      setClusters(fetchedClusters);
    };

    load();
  }, [projectId]);

  return clusters === undefined
    ? {
        clusters: undefined,
        isLoading: true,
        error: undefined,
      }
    : {
        clusters,
        isLoading: false,
        error: undefined,
      };
};

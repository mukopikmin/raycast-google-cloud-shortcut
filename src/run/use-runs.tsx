import { useEffect, useState } from "react";
import { listCloudRuns, Run } from "./run";

type UseRunsResult =
  | {
      runs: Run[];
      isLoading: false;
      error: undefined;
    }
  | {
      runs: undefined;
      isLoading: true;
      error: undefined;
    };

export const useRuns = (projectId: string): UseRunsResult => {
  const [runs, setRuns] = useState<Run[] | undefined>(undefined);

  useEffect(() => {
    const load = async () => {
      const fetchedRuns = await listCloudRuns(projectId);
      setRuns(fetchedRuns);
    };

    load();
  }, [projectId]);

  return runs === undefined
    ? {
        runs: undefined,
        isLoading: true,
        error: undefined,
      }
    : {
        runs,
        isLoading: false,
        error: undefined,
      };
};

import { useEffect, useState } from "react";
import { useGoogleApi } from "../auth/google";
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
  const { accessToken } = useGoogleApi();
  const [runs, setRuns] = useState<Run[] | undefined>(undefined);

  useEffect(() => {
    const load = async () => {
      const fetchedRuns = await listCloudRuns(projectId, accessToken);
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

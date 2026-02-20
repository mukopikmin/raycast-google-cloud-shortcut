import { useEffect, useState } from "react";
import { useGoogleApi } from "../auth/google";
import { listCloudRuns } from "./api";
import { CloudRun } from "./types";

type UseCloudRunsResult =
  | {
      runs: CloudRun[];
      isLoading: false;
      error: undefined;
    }
  | {
      runs: undefined;
      isLoading: true;
      error: undefined;
    };

export const useCloudRuns = (projectId: string): UseCloudRunsResult => {
  const { accessToken } = useGoogleApi();
  const [runs, setRuns] = useState<CloudRun[] | undefined>(undefined);

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

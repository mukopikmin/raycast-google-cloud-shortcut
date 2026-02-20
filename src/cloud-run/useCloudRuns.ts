import { useEffect, useState } from "react";
import { useGoogleApi } from "../auth/google";
import { listCloudRuns } from "./api";
import { CloudRun } from "./types";

type UseCloudRunsResult =
  | {
      runs: CloudRun[];
      isLoading: false;
    }
  | {
      runs: undefined;
      isLoading: true;
    };

export const useCloudRuns = (projectId: string): UseCloudRunsResult => {
  const { accessToken } = useGoogleApi();
  const [runs, setRuns] = useState<CloudRun[] | undefined>();

  useEffect(() => {
    (async () => {
      const data = await listCloudRuns(projectId, accessToken);
      setRuns(data);
    })();
  }, [projectId]);

  return runs === undefined
    ? {
        runs: undefined,
        isLoading: true,
      }
    : {
        runs,
        isLoading: false,
      };
};

import { useState } from "react";
import { usePromise } from "@raycast/utils";
import { useGoogleApi } from "../auth/google";
import { listCloudRunJobs } from "./api";
import { CloudRunDeployment } from "./types";

type SuccessResult = {
  jobs: CloudRunDeployment[];
  isLoading: boolean;
  error: undefined;
};

type LoadingResult = {
  jobs: undefined;
  isLoading: true;
  error: undefined;
};

type ErrorResult = {
  jobs: undefined;
  isLoading: false;
  error: Error;
};

type UseCloudRunJobsResult = SuccessResult | LoadingResult | ErrorResult;

export const useCloudRunJobs = (projectId: string): UseCloudRunJobsResult => {
  const { accessToken } = useGoogleApi();
  const [progressiveJobs, setProgressiveJobs] = useState<CloudRunDeployment[]>([]);

  const { isLoading, error } = usePromise(
    async (projId: string, token: string) => {
      setProgressiveJobs([]);
      return await listCloudRunJobs(projId, token, (jobs) => {
        setProgressiveJobs([...jobs]);
      });
    },
    [projectId, accessToken],
  );

  if (error) {
    return { jobs: undefined, isLoading: false, error };
  }

  if (isLoading && progressiveJobs.length === 0) {
    return { jobs: undefined, isLoading: true, error: undefined };
  }

  return { jobs: progressiveJobs, isLoading, error: undefined };
};

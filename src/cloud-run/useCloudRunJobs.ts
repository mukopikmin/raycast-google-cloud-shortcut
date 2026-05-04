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
  const { data, isLoading, error } = usePromise(
    async (projId: string, token: string) => {
      return await listCloudRunJobs(projId, token);
    },
    [projectId, accessToken],
  );

  if (error) {
    return { jobs: undefined, isLoading: false, error };
  }

  if (!data) {
    return { jobs: undefined, isLoading: true, error: undefined };
  }

  return { jobs: data, isLoading, error: undefined };
};

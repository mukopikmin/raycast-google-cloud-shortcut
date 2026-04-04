import { usePromise } from "@raycast/utils";
import { useGoogleApi } from "../auth/google";
import { listCloudRunJobs } from "./api";
import { CloudRunDeployment } from "./types";

type UseCloudRunJobsResult =
  | {
      jobs: CloudRunDeployment[];
      isLoading: boolean;
      error: undefined;
    }
  | {
      jobs: undefined;
      isLoading: true;
      error: undefined;
    }
  | {
      jobs: undefined;
      isLoading: false;
      error: Error;
    };

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

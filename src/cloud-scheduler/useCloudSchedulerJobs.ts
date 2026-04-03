import { usePromise } from "@raycast/utils";
import { CloudSchedulerJob } from "./types";
import { listCloudSchedulerJobs } from "./api";
import { useGoogleApi } from "../auth/google";

type UseCloudSchedulerJobsResult =
  | {
      scheduledJobs: CloudSchedulerJob[];
      isLoading: boolean;
      error: undefined;
    }
  | {
      scheduledJobs: undefined;
      isLoading: true;
      error: undefined;
    }
  | {
      scheduledJobs: undefined;
      isLoading: false;
      error: Error;
    };

export const useCloudSchedulerJobs = (projectId: string, locationId: string): UseCloudSchedulerJobsResult => {
  const { accessToken } = useGoogleApi();
  const { data, isLoading, error } = usePromise(
    async (projId: string, locId: string, token: string) => {
      return await listCloudSchedulerJobs(projId, locId, token);
    },
    [projectId, locationId, accessToken],
  );

  if (error) {
    return { scheduledJobs: undefined, isLoading: false, error };
  }

  if (!data) {
    return { scheduledJobs: undefined, isLoading: true, error: undefined };
  }

  return { scheduledJobs: data, isLoading, error: undefined };
};

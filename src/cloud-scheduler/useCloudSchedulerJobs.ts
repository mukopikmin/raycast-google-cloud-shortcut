import { useEffect, useState } from "react";
import { CloudSchedulerJob } from "./types";
import { listCloudSchedulerJobs } from "./api";
import { useGoogleApi } from "../auth/google";

type UseCloudSchedulerJobsResult =
  | {
      scheduledJobs: CloudSchedulerJob[];
      isLoading: false;
    }
  | {
      scheduledJobs: undefined;
      isLoading: true;
    };

export const useCloudSchedulerJobs = (projectId: string, locationId: string) => {
  const { accessToken } = useGoogleApi();
  const [scheduledJobs, setScheduledJobs] = useState<CloudSchedulerJob[] | undefined>();

  useEffect(() => {
    (async () => {
      const jobs = await listCloudSchedulerJobs(projectId, locationId, accessToken);
      setScheduledJobs(jobs);
    })();
  }, [projectId]);

  return scheduledJobs === undefined
    ? { scheduledJobs: undefined, isLoading: true }
    : { scheduledJobs, isLoading: false };
};

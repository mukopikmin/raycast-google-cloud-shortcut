import { useEffect, useState } from "react";
import { useGoogleApi } from "../auth/google";
import { CloudRunDeployment } from "./types";
import { listCloudRunJobs } from "./api";

type UseCloudRunJobsResult =
  | {
      jobs: CloudRunDeployment[];
      isLoading: false;
    }
  | {
      jobs: undefined;
      isLoading: true;
    };

export const useCloudRunJobs = (projectId: string): UseCloudRunJobsResult => {
  const { accessToken } = useGoogleApi();
  const [jobs, setJobs] = useState<CloudRunDeployment[] | undefined>();

  useEffect(() => {
    (async () => {
      const data = await listCloudRunJobs(projectId, accessToken);
      setJobs(data);
    })();
  }, [projectId]);

  return jobs === undefined
    ? {
        jobs: undefined,
        isLoading: true,
      }
    : {
        jobs,
        isLoading: false,
      };
};

import { fetchGoogleApi } from "../auth/api";
import { CloudSchedulerJob, createCloudSchedulerJob } from "./types";

type CloudSchedulerJobsResponse = {
  jobs: {
    name: string;
    region: string;
    schedule: string;
    timeZone: string;
    description: string;
  }[];
};

/**
 * @see https://docs.cloud.google.com/scheduler/docs/reference/rest/v1beta1/projects.locations.jobs/list
 */
export const listCloudSchedulerJobs = async (
  projectId: string,
  locationId: string,
  accessToken: string,
): Promise<CloudSchedulerJob[]> => {
  const data = await fetchGoogleApi<CloudSchedulerJobsResponse>(
    `https://cloudscheduler.googleapis.com/v1beta1/projects/${projectId}/locations/${locationId}/jobs`,
    accessToken,
  );

  return data.jobs?.map((job) => {
    // projects/PROJECT_ID/locations/LOCATION_ID/jobs/JOB_ID
    const parts = job.name.split("/");
    const region = parts[parts.length - 3];
    const name = parts[parts.length - 1];

    return createCloudSchedulerJob({
      projectId,
      name,
      region,
      schedule: job.schedule,
      timeZone: job.timeZone,
      description: job.description,
    });
  });
};

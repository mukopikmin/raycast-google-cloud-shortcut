import { fetchGoogleApi } from "../auth/api";
import { CloudSchedulerJob, createCloudSchedulerJob } from "./types";

type CloudSchedulerJobsResponse = {
  jobs?: {
    name: string;
    region: string;
    schedule: string;
    timeZone: string;
    description: string;
  }[];
};

type CloudSchedulerJobResponse = NonNullable<CloudSchedulerJobsResponse["jobs"]>[number];

const listCloudSchedulerJobsByType = async (
  projectId: string,
  locationId: string,
  accessToken: string,
  legacyAppEngineCron = false,
): Promise<CloudSchedulerJobResponse[]> => {
  const url = new URL(
    `https://cloudscheduler.googleapis.com/v1beta1/projects/${projectId}/locations/${locationId}/jobs`,
  );
  if (legacyAppEngineCron) {
    url.searchParams.set("legacyAppEngineCron", "true");
  }

  const data = await fetchGoogleApi<CloudSchedulerJobsResponse>(url.toString(), accessToken);

  return data.jobs ?? [];
};

const createCloudSchedulerJobs = (projectId: string, jobs: CloudSchedulerJobResponse[]): CloudSchedulerJob[] => {
  return jobs.map((job) => {
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

/**
 * @see https://docs.cloud.google.com/scheduler/docs/reference/rest/v1beta1/projects.locations.jobs/list
 */
export const listCloudSchedulerJobs = async (
  projectId: string,
  locationId: string,
  accessToken: string,
): Promise<CloudSchedulerJob[]> => {
  const [defaultJobs, legacyJobs] = await Promise.all([
    listCloudSchedulerJobsByType(projectId, locationId, accessToken),
    listCloudSchedulerJobsByType(projectId, locationId, accessToken, true),
  ]);

  const mergedJobs = [...defaultJobs, ...legacyJobs];
  const jobsByResourceName = new Map<string, CloudSchedulerJobResponse>();

  for (const job of mergedJobs) {
    jobsByResourceName.set(job.name, job);
  }

  return createCloudSchedulerJobs(projectId, Array.from(jobsByResourceName.values()));
};

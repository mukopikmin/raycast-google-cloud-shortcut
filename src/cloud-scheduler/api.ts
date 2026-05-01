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
  nextPageToken?: string;
};

type CloudSchedulerJobResponse = NonNullable<CloudSchedulerJobsResponse["jobs"]>[number];
type CloudSchedulerLocationsResponse = {
  locations?: {
    locationId: string;
    displayName?: string;
  }[];
};

export type CloudSchedulerLocation = {
  id: string;
  name: string;
};

const listCloudSchedulerJobsByType = async (
  projectId: string,
  locationId: string,
  accessToken: string,
  legacyAppEngineCron = false,
): Promise<CloudSchedulerJobResponse[]> => {
  const apiVersion = legacyAppEngineCron ? "v1beta1" : "v1";
  const baseUrl = `https://cloudscheduler.googleapis.com/${apiVersion}/projects/${projectId}/locations/${locationId}/jobs`;
  const allJobs: CloudSchedulerJobResponse[] = [];
  let pageToken: string | undefined;

  do {
    const url = new URL(baseUrl);
    if (legacyAppEngineCron) url.searchParams.set("legacyAppEngineCron", "true");
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const data = await fetchGoogleApi<CloudSchedulerJobsResponse>(url.toString(), accessToken);
    if (data.jobs) allJobs.push(...data.jobs);
    pageToken = data.nextPageToken;
  } while (pageToken);

  return allJobs;
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
 * @see https://docs.cloud.google.com/scheduler/docs/reference/rest/v1beta1/projects.locations/list
 */
export const listCloudSchedulerLocations = async (
  projectId: string,
  accessToken: string,
): Promise<CloudSchedulerLocation[]> => {
  const data = await fetchGoogleApi<CloudSchedulerLocationsResponse>(
    `https://cloudscheduler.googleapis.com/v1beta1/projects/${projectId}/locations`,
    accessToken,
  );

  return (data.locations ?? [])
    .map((location) => ({
      id: location.locationId,
      name: location.displayName || location.locationId,
    }))
    .sort((a, b) => a.id.localeCompare(b.id));
};

/**
 * @see https://docs.cloud.google.com/scheduler/docs/reference/rest/v1beta1/projects.locations.jobs/list
 */
export const listCloudSchedulerJobs = async (
  projectId: string,
  locationId: string,
  accessToken: string,
): Promise<CloudSchedulerJob[]> => {
  const defaultJobsPromise = listCloudSchedulerJobsByType(projectId, locationId, accessToken);
  const legacyJobsPromise = listCloudSchedulerJobsByType(projectId, locationId, accessToken, true);

  const defaultJobs = await defaultJobsPromise;
  let legacyJobs: CloudSchedulerJobResponse[] = [];
  try {
    legacyJobs = await legacyJobsPromise;
  } catch (error) {
    if (defaultJobs.length === 0) {
      throw error;
    }
  }

  const mergedJobs = [...defaultJobs, ...legacyJobs];
  const jobsByResourceName = new Map<string, CloudSchedulerJobResponse>();

  for (const job of mergedJobs) {
    jobsByResourceName.set(job.name, job);
  }

  return createCloudSchedulerJobs(projectId, Array.from(jobsByResourceName.values()));
};

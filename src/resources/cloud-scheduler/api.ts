import { fetchGoogleApi } from "../../auth/api";
import { createLocation, Location } from "../../region/types";
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

export type CloudSchedulerJobsPage = {
  jobs: CloudSchedulerJob[];
  nextPageToken?: string;
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
export const listCloudSchedulerJobsPage = async (
  projectId: string,
  locationId: string,
  accessToken: string,
  options: { pageSize: number; pageToken?: string; legacyAppEngineCron?: boolean },
): Promise<CloudSchedulerJobsPage> => {
  const apiVersion = options.legacyAppEngineCron ? "v1beta1" : "v1";
  const baseUrl = `https://cloudscheduler.googleapis.com/${apiVersion}/projects/${projectId}/locations/${locationId}/jobs`;
  const url = new URL(baseUrl);
  url.searchParams.set("pageSize", options.pageSize.toString());
  if (options.legacyAppEngineCron) url.searchParams.set("legacyAppEngineCron", "true");
  if (options.pageToken) url.searchParams.set("pageToken", options.pageToken);

  const data = await fetchGoogleApi<CloudSchedulerJobsResponse>(url.toString(), accessToken);
  return {
    jobs: createCloudSchedulerJobs(projectId, data.jobs ?? []),
    nextPageToken: data.nextPageToken,
  };
};

/**
 * @see https://docs.cloud.google.com/scheduler/docs/reference/rest/v1beta1/projects.locations/list
 */
export const listCloudSchedulerLocations = async (projectId: string, accessToken: string): Promise<Location[]> => {
  const data = await fetchGoogleApi<CloudSchedulerLocationsResponse>(
    `https://cloudscheduler.googleapis.com/v1beta1/projects/${projectId}/locations`,
    accessToken,
  );

  return (data.locations ?? [])
    .map((location) => createLocation(location.locationId, location.displayName))
    .sort((a, b) => a.id.localeCompare(b.id));
};

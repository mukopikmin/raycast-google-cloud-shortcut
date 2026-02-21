import { fetchGoogleApi } from "../auth/api";
import { CloudRunDeployment } from "./types";

type CloudRunServicesResponse = {
  services: {
    name: string;
    description: string;
    uid: string;
    generation: string;
  }[];
};

type CloudRunJobsResponse = {
  jobs: {
    name: string;
    uid: string;
    generation: string;
  }[];
};

/**
 * @see https://docs.cloud.google.com/run/docs/reference/rest/v2/projects.locations.services/list
 */
export const listCloudRunServices = async (
  projectId: string,
  accessToken: string,
): Promise<CloudRunDeployment[]> => {
  const body = await fetchGoogleApi<CloudRunServicesResponse>(
    `https://run.googleapis.com/v2/projects/${projectId}/locations/-/services`,
    accessToken,
  );

  return body.services.map((service) => {
    const parts = service.name.split("/");
    const region = parts[parts.length - 3];
    const name = parts[parts.length - 1];

    return {
      id: service.uid,
      name,
      region,
      deployType: "services" as const,
      url:
        `https://console.cloud.google.com/run/detail/${region}/${name}?project=${projectId}`,
    };
  });
};

/**
 * @see https://docs.cloud.google.com/run/docs/reference/rest/v2/projects.locations.jobs/list
 */
export const listCloudRunJobs = async (
  projectId: string,
  accessToken: string,
): Promise<CloudRunDeployment[]> => {
  const body = await fetchGoogleApi<CloudRunJobsResponse>(
    `https://run.googleapis.com/v2/projects/${projectId}/locations/-/jobs`,
    accessToken,
  );

  return body.jobs.map((job) => {
    const parts = job.name.split("/");
    const region = parts[parts.length - 3];
    const name = parts[parts.length - 1];

    return {
      id: job.uid,
      name,
      region,
      deployType: "jobs" as const,
      url:
        `https://console.cloud.google.com/run/jobs/detail/${region}/${name}?project=${projectId}`,
    };
  });
};

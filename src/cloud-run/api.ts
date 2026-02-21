import { fetchGoogleApi } from "../auth/api";
import { CloudRunDeployment } from "./types";

type CloudRunServicesResponse = {
  services: {
    name: string;
    description: string;
    uid: string;
    generation: string;
    // Only exists when the service is deployes as Cloud Functions
    buildConfig?: {
      functionTarget: string;
    };
  }[];
};

type CloudRunJobsResponse = {
  items: {
    metadata: {
      name: string;
      uid: string;
      generation: string;
      labels: {
        "cloud.googleapis.com/location": string;
      };
    };
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
      deployType: service.buildConfig === undefined
        ? "Container Services"
        : "Function Services",
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
    `https://run.googleapis.com/apis/run.googleapis.com/v1/namespaces/${projectId}/jobs`,
    accessToken,
  );

  return body.items.map((job) => {
    const name = job.metadata.name;
    const region = job.metadata.labels["cloud.googleapis.com/location"];

    return {
      id: job.metadata.uid,
      name,
      region,
      deployType: "Jobs" as const,
      url:
        `https://console.cloud.google.com/run/jobs/detail/${region}/${name}?project=${projectId}`,
    };
  });
};

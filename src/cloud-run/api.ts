import { fetchGoogleApi } from "../auth/api";
import { createLocation, Location } from "../region/types";
import { CloudRunDeployment, createCloudRunDeployment } from "./types";

type CloudRunServicesResponse = {
  services?: {
    name: string;
    description: string;
    uid: string;
    generation: string;
    uri?: string;
    // Only exists when the service is deployes as Cloud Functions
    buildConfig?: {
      functionTarget: string;
    };
  }[];
  nextPageToken?: string;
};

type CloudRunLocationsResponse = {
  locations?: {
    locationId: string;
    displayName?: string;
  }[];
};

type CloudRunJobsResponse = {
  items?: {
    metadata: {
      name: string;
      uid: string;
      generation: string;
      labels: {
        "cloud.googleapis.com/location": string;
      };
    };
  }[];
  metadata?: {
    continue?: string;
  };
};

type CloudRunWorkerPoolsResponse = {
  items?: {
    metadata: {
      name: string;
      uid: string;
      generation: string;
      labels: {
        "cloud.googleapis.com/location": string;
      };
    };
  }[];
  metadata?: {
    continue?: string;
  };
};

export type CloudRunDeploymentPage = {
  deployments: CloudRunDeployment[];
  nextPageToken?: string;
};

/**
 * @see https://docs.cloud.google.com/run/docs/reference/rest/v2/projects.locations.services/list
 */
export const listCloudRunServicesPage = async (
  projectId: string,
  locationId: string,
  accessToken: string,
  options: { pageSize: number; pageToken?: string },
): Promise<CloudRunDeploymentPage> => {
  const query = new URLSearchParams({
    pageSize: options.pageSize.toString(),
  });
  if (options.pageToken) {
    query.set("pageToken", options.pageToken);
  }

  const suffix = query.toString();
  const body = await fetchGoogleApi<CloudRunServicesResponse>(
    `https://run.googleapis.com/v2/projects/${projectId}/locations/${locationId}/services${suffix ? `?${suffix}` : ""}`,
    accessToken,
  );

  const services =
    body.services?.map((service) => {
      const parts = service.name.split("/");
      const region = parts[parts.length - 3];
      const name = parts[parts.length - 1];

      return createCloudRunDeployment({
        id: service.uid,
        projectId,
        name,
        region,
        deployType: service.buildConfig === undefined ? "Container Services" : "Function Services",
        url: `https://console.cloud.google.com/run/detail/${region}/${name}?project=${projectId}`,
        uri: service.uri,
      });
    }) ?? [];

  return { deployments: services, nextPageToken: body.nextPageToken };
};

export const listCloudRunLocations = async (projectId: string, accessToken: string): Promise<Location[]> => {
  const body = await fetchGoogleApi<CloudRunLocationsResponse>(
    `https://run.googleapis.com/v2/projects/${projectId}/locations`,
    accessToken,
  );

  return (body.locations ?? [])
    .map((location) => createLocation(location.locationId, location.displayName))
    .sort((a, b) => a.id.localeCompare(b.id));
};

/**
 * @see https://docs.cloud.google.com/run/docs/reference/rest/v2/projects.locations.jobs/list
 */
export const listCloudRunJobsPage = async (
  projectId: string,
  accessToken: string,
  options: { pageSize: number; pageToken?: string },
): Promise<CloudRunDeploymentPage> => {
  const query = new URLSearchParams({
    limit: options.pageSize.toString(),
  });
  if (options.pageToken) {
    query.set("continue", options.pageToken);
  }

  const suffix = query.toString();
  const body = await fetchGoogleApi<CloudRunJobsResponse>(
    `https://run.googleapis.com/apis/run.googleapis.com/v1/namespaces/${projectId}/jobs${suffix ? `?${suffix}` : ""}`,
    accessToken,
  );

  const jobs =
    body.items?.map((job) => {
      const name = job.metadata.name;
      const region = job.metadata.labels["cloud.googleapis.com/location"];

      return createCloudRunDeployment({
        id: job.metadata.uid,
        projectId,
        name,
        region,
        deployType: "Jobs" as const,
        url: `https://console.cloud.google.com/run/jobs/details/${region}/${name}?project=${projectId}`,
      });
    }) ?? [];

  return { deployments: jobs, nextPageToken: body.metadata?.continue };
};

export const listCloudRunWorkerPoolsPage = async (
  projectId: string,
  accessToken: string,
  options: { pageSize: number; pageToken?: string },
): Promise<CloudRunDeploymentPage> => {
  const query = new URLSearchParams({
    limit: options.pageSize.toString(),
  });
  if (options.pageToken) {
    query.set("continue", options.pageToken);
  }

  const suffix = query.toString();
  const body = await fetchGoogleApi<CloudRunWorkerPoolsResponse>(
    `https://run.googleapis.com/apis/run.googleapis.com/v1/namespaces/${projectId}/workerpools${suffix ? `?${suffix}` : ""}`,
    accessToken,
  );

  const workerPools =
    body.items?.map((workerPool) => {
      const name = workerPool.metadata.name;
      const region = workerPool.metadata.labels["cloud.googleapis.com/location"];

      return createCloudRunDeployment({
        id: workerPool.metadata.uid,
        projectId,
        name,
        region,
        deployType: "Worker Pools" as const,
        url: `https://console.cloud.google.com/run/worker-pools/detail/${region}/${name}?project=${projectId}`,
      });
    }) ?? [];

  return { deployments: workerPools, nextPageToken: body.metadata?.continue };
};

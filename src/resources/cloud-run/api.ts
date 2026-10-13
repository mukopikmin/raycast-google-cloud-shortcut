import { fetchGoogleApi } from "../../auth/api";
import {
  CloudRunDeploymentPage,
  CloudRunServicesPage,
  CloudRunServicesResponse,
  CloudRunRegionalServicesResponse,
  createCloudRunDeployment,
  CloudRunPageOptions,
} from "./types";

type CloudRunLocationsResponse = {
  locations?: { locationId: string }[];
  nextPageToken?: string;
};

/** @see https://docs.cloud.google.com/run/docs/reference/rest/v1/projects.locations/list */
export const listCloudRunLocationsPage = async (
  projectId: string,
  accessToken: string,
  options: CloudRunPageOptions,
) => {
  const query = new URLSearchParams({ pageSize: String(options.pageSize) });
  if (options.pageToken) query.set("pageToken", options.pageToken);
  const body = await fetchGoogleApi<CloudRunLocationsResponse>(
    `https://run.googleapis.com/v1/projects/${projectId}/locations?${query}`,
    accessToken,
    options.signal ? { signal: options.signal } : undefined,
  );
  return {
    regions: [...new Set((body.locations ?? []).map(({ locationId }) => locationId))]
      .filter((region) => region && region !== "global" && region !== "-")
      .sort(),
    nextPageToken: body.nextPageToken || undefined,
  };
};

/** @see https://docs.cloud.google.com/run/docs/reference/rest/v2/projects.locations.services/list */
export const listCloudRunRegionalServicesPage = async (
  projectId: string,
  region: string,
  accessToken: string,
  options: CloudRunPageOptions,
): Promise<CloudRunServicesPage> => {
  const query = new URLSearchParams({
    pageSize: String(options.pageSize),
    fields: "services(name,uid,uri,labels,buildConfig),nextPageToken",
  });
  if (options.pageToken) query.set("pageToken", options.pageToken);
  const body = await fetchGoogleApi<CloudRunRegionalServicesResponse>(
    `https://run.googleapis.com/v2/projects/${projectId}/locations/${region}/services?${query}`,
    accessToken,
    options.signal ? { signal: options.signal } : undefined,
  );
  return {
    deployments: (body.services ?? []).map((service) => {
      const name = service.name.split("/").at(-1)!;
      return createCloudRunDeployment({
        id: service.uid || service.name,
        projectId,
        name,
        region,
        deployType:
          service.buildConfig || service.labels?.["goog-managed-by"] === "cloudfunctions"
            ? "Function Services"
            : "Container Services",
        url: `https://console.cloud.google.com/run/detail/${region}/${name}?project=${projectId}`,
        uri: service.uri,
      });
    }),
    nextPageToken: body.nextPageToken || undefined,
    unreachable: [],
  };
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

/**
 * @see https://docs.cloud.google.com/run/docs/reference/rest/v1/namespaces.services/list
 */
export const listCloudRunServicesPage = async (
  projectId: string,
  accessToken: string,
  options: CloudRunPageOptions,
): Promise<CloudRunServicesPage> => {
  const query = new URLSearchParams({ limit: options.pageSize.toString() });
  if (options.pageToken) {
    query.set("continue", options.pageToken);
  }

  const body = await fetchGoogleApi<CloudRunServicesResponse>(
    `https://run.googleapis.com/apis/serving.knative.dev/v1/namespaces/${projectId}/services?${query}`,
    accessToken,
    options.signal ? { signal: options.signal } : undefined,
  );

  return cloudRunServicesPage(body, projectId);
};

/**
 * Global v1 listing, as used by gcloud's run.global_methods.ListServices.
 * Leave limit unset instead of imposing the browsing snapshot's page size.
 * @see https://docs.cloud.google.com/run/docs/reference/rest
 */
export const listCloudRunGlobalServicesPage = async (
  projectId: string,
  accessToken: string,
  options: Pick<CloudRunPageOptions, "pageToken" | "signal">,
): Promise<CloudRunServicesPage> => {
  const query = new URLSearchParams({
    fields: "items(metadata(name,uid,labels,annotations),status(url)),metadata(continue),unreachable",
  });
  if (options.pageToken) query.set("continue", options.pageToken);
  const body = await fetchGoogleApi<CloudRunServicesResponse>(
    `https://run.googleapis.com/v1/projects/${projectId}/locations/-/services?${query}`,
    accessToken,
    options.signal ? { signal: options.signal } : undefined,
  );
  return cloudRunServicesPage(body, projectId);
};

const cloudRunServicesPage = (body: CloudRunServicesResponse, projectId: string): CloudRunServicesPage => {
  const services =
    body.items?.map((service) => {
      const { name, uid, labels, annotations } = service.metadata;
      const region = labels["cloud.googleapis.com/location"];
      const isFunction = Boolean(
        annotations?.["run.googleapis.com/build-function-target"] ||
        annotations?.["run.googleapis.com/function-target"],
      );

      return createCloudRunDeployment({
        id: uid,
        projectId,
        name,
        region,
        deployType: isFunction ? "Function Services" : "Container Services",
        url: `https://console.cloud.google.com/run/detail/${region}/${name}?project=${projectId}`,
        uri: service.status?.url,
      });
    }) ?? [];

  return {
    deployments: services,
    nextPageToken: body.metadata?.continue || undefined,
    unreachable: [...new Set(body.unreachable ?? [])].filter(Boolean).sort(),
  };
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

import { fetchGoogleApi } from "../auth/api";
import { CloudRunDeployment, createCloudRunDeployment } from "./types";

type CloudRunServicesResponse = {
  services?: {
    name: string;
    description: string;
    uid: string;
    generation: string;
    // Only exists when the service is deployes as Cloud Functions
    buildConfig?: {
      functionTarget: string;
    };
  }[];
  nextPageToken?: string;
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
 * @see https://docs.cloud.google.com/run/docs/reference/rest/v2/projects.locations.services/list
 */
export const listCloudRunServices = async (
  projectId: string,
  accessToken: string,
  onPageFetched?: (services: CloudRunDeployment[]) => void,
): Promise<CloudRunDeployment[]> => {
  const allServices: CloudRunDeployment[] = [];
  let pageToken: string | undefined;

  do {
    const query = new URLSearchParams();
    if (pageToken) {
      query.set("pageToken", pageToken);
    }

    const suffix = query.toString();
    const body = await fetchGoogleApi<CloudRunServicesResponse>(
      `https://run.googleapis.com/v2/projects/${projectId}/locations/-/services${suffix ? `?${suffix}` : ""}`,
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
        });
      }) ?? [];

    allServices.push(...services);
    onPageFetched?.(allServices);

    pageToken = body.nextPageToken;
  } while (pageToken);

  return allServices;
};

/**
 * @see https://docs.cloud.google.com/run/docs/reference/rest/v2/projects.locations.jobs/list
 */
export const listCloudRunJobs = async (
  projectId: string,
  accessToken: string,
  onPageFetched?: (jobs: CloudRunDeployment[]) => void,
): Promise<CloudRunDeployment[]> => {
  const allJobs: CloudRunDeployment[] = [];
  let continueToken: string | undefined;

  do {
    const query = new URLSearchParams();
    if (continueToken) {
      query.set("continue", continueToken);
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

    allJobs.push(...jobs);
    onPageFetched?.(allJobs);

    continueToken = body.metadata?.continue;
  } while (continueToken);

  return allJobs;
};

export const listCloudRunWorkerPools = async (
  projectId: string,
  accessToken: string,
  onPageFetched?: (workerPools: CloudRunDeployment[]) => void,
): Promise<CloudRunDeployment[]> => {
  const allWorkerPools: CloudRunDeployment[] = [];
  let continueToken: string | undefined;

  do {
    const query = new URLSearchParams();
    if (continueToken) {
      query.set("continue", continueToken);
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

    allWorkerPools.push(...workerPools);
    onPageFetched?.(allWorkerPools);

    continueToken = body.metadata?.continue;
  } while (continueToken);

  return allWorkerPools;
};

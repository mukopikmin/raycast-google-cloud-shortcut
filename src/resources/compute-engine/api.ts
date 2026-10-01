import { fetchGoogleApi } from "../../auth/api";
import { ComputeEngineInstance } from "./types";

type ComputeEngineInstancesResponse = {
  items?: {
    [key: string]: {
      instances?: {
        id: string;
        name: string;
        status: string;
        zone: string;
        machineType: string;
        networkInterfaces?: {
          networkIP?: string;
          accessConfigs?: {
            natIP?: string;
          }[];
        }[];
      }[];
      warning?: {
        code: string;
        message: string;
      };
    };
  };
  nextPageToken?: string;
};

export type ComputeEngineInstancesPage = {
  instances: ComputeEngineInstance[];
  nextPageToken?: string;
};

/**
 * @see https://cloud.google.com/compute/docs/reference/rest/v1/instances/aggregatedList
 */
export const listComputeEngineInstancesPage = async (
  projectId: string,
  accessToken: string,
  options: { pageSize: number; pageToken?: string },
): Promise<ComputeEngineInstancesPage> => {
  const query = new URLSearchParams({
    maxResults: options.pageSize.toString(),
    returnPartialSuccess: "true",
  });
  if (options.pageToken) {
    query.set("pageToken", options.pageToken);
  }

  const body = await fetchGoogleApi<ComputeEngineInstancesResponse>(
    `https://compute.googleapis.com/compute/v1/projects/${projectId}/aggregated/instances?${query.toString()}`,
    accessToken,
  );

  return {
    instances: Object.values(body.items || {})
      .flatMap((item) => item.instances || [])
      .map((instance) => {
        const zone = instance.zone.split("/").pop() || "";
        const machineType = instance.machineType.split("/").pop() || "";
        const internalIp = instance.networkInterfaces?.[0]?.networkIP;
        const externalIp = instance.networkInterfaces?.[0]?.accessConfigs?.[0]?.natIP;

        return {
          id: instance.id,
          kind: "gce-instance" as const,
          projectId,
          instanceId: instance.id,
          name: instance.name,
          status: instance.status,
          zone,
          machineType,
          internalIp,
          externalIp,
          url: `https://console.cloud.google.com/compute/instancesDetail/zones/${zone}/instances/${instance.name}?project=${projectId}`,
        };
      }),
    nextPageToken: body.nextPageToken,
  };
};

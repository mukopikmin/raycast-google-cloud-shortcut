import { fetchGoogleApi } from "../auth/api";
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

/**
 * @see https://cloud.google.com/compute/docs/reference/rest/v1/instances/aggregatedList
 */
export const listComputeEngineInstances = async (
  projectId: string,
  accessToken: string,
  onPageFetched?: (instances: ComputeEngineInstance[]) => void,
): Promise<ComputeEngineInstance[]> => {
  const allInstances: ComputeEngineInstance[] = [];
  let pageToken: string | undefined;

  do {
    const query = new URLSearchParams();
    if (pageToken) {
      query.set("pageToken", pageToken);
    }
    // Recommended to set returnPartialSuccess=true for aggregatedList
    query.set("returnPartialSuccess", "true");

    const suffix = query.toString();
    const body = await fetchGoogleApi<ComputeEngineInstancesResponse>(
      `https://compute.googleapis.com/compute/v1/projects/${projectId}/aggregated/instances${suffix ? `?${suffix}` : ""}`,
      accessToken,
    );

    const instances = Object.values(body.items || {})
      .flatMap((item) => item.instances || [])
      .map((instance) => {
        const zone = instance.zone.split("/").pop() || "";
        const machineType = instance.machineType.split("/").pop() || "";
        const internalIp = instance.networkInterfaces?.[0]?.networkIP;
        const externalIp = instance.networkInterfaces?.[0]?.accessConfigs?.[0]?.natIP;

        return {
          id: instance.id,
          name: instance.name,
          status: instance.status,
          zone,
          machineType,
          internalIp,
          externalIp,
          url: `https://console.cloud.google.com/compute/instancesDetail/zones/${zone}/instances/${instance.name}?project=${projectId}`,
        };
      });

    allInstances.push(...instances);
    onPageFetched?.(allInstances);

    pageToken = body.nextPageToken;
  } while (pageToken);

  return allInstances;
};

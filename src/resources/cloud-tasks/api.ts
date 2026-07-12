import { fetchGoogleApi } from "../../auth/api";
import { createLocation, Location } from "../../region/types";
import { CloudTasksQueue } from "./types";

type CloudTasksQueuesResponse = {
  queues?: {
    name: string;
    state: string;
  }[];
};

export const listCloudTasksQueues = async (
  projectId: string,
  locationId: string,
  accessToken: string,
): Promise<CloudTasksQueue[]> => {
  const data = await fetchGoogleApi<CloudTasksQueuesResponse>(
    `https://cloudtasks.googleapis.com/v2/projects/${projectId}/locations/${locationId}/queues`,
    accessToken,
  );

  return (
    data.queues?.map((queue) => {
      // projects/PROJECT_ID/locations/LOCATION_ID/queues/QUEUE_ID
      const parts = queue.name.split("/");
      const region = parts[parts.length - 3];
      const name = parts[parts.length - 1];

      return {
        name,
        region,
        state: queue.state,
        url: `https://console.cloud.google.com/cloudtasks/queue/${region}/${name}?project=${projectId}`,
      };
    }) ?? []
  );
};

type CloudTasksLocationsResponse = {
  locations?: {
    locationId: string;
    displayName?: string;
  }[];
};

/**
 * @see https://cloud.google.com/tasks/docs/reference/rest/v2/projects.locations/list
 */
export const listCloudTasksLocations = async (projectId: string, accessToken: string): Promise<Location[]> => {
  const data = await fetchGoogleApi<CloudTasksLocationsResponse>(
    `https://cloudtasks.googleapis.com/v2/projects/${projectId}/locations`,
    accessToken,
  );

  return (data.locations ?? [])
    .map((loc) => createLocation(loc.locationId, loc.displayName))
    .sort((a, b) => a.id.localeCompare(b.id));
};

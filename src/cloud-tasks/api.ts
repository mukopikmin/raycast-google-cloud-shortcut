import { fetchGoogleApi } from "../auth/api";
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

import { fetchGoogleApi } from "../auth/api";
import { TasksQueue, TasksQueuesResponse } from "./types";

export const listTasksQueues = async (
  projectId: string,
  locationId: string,
  accessToken: string,
): Promise<TasksQueue[]> => {
  const data = await fetchGoogleApi<TasksQueuesResponse>(
    `https://cloudtasks.googleapis.com/v2/projects/${projectId}/locations/${locationId}/queues`,
    accessToken,
  );

  console.log(accessToken);
  return data.queues.map((queue) => {
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
  });
};

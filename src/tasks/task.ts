import { useGoogleApi } from "../auth/google";

export type TasksQueue = {
  name: string;
  region: string;
  state: string;
  url: string;
};

export type TasksLocation = {
  id: string;
};

type TasksQueuesResponse = {
  queues: {
    name: string;
    state: string;
  }[];
};

type TasksLocationsResponse = {
  locations: {
    locationId: string;
  }[];
};

export const listLocations = async (projectId: string): Promise<TasksLocation[]> => {
  const googleApi = useGoogleApi();
  const response = await fetch(`https://cloudtasks.googleapis.com/v2beta3/projects/${projectId}/locations`, {
    headers: {
      Authorization: `Bearer ${googleApi.accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Tasks locations: ${response.statusText}`);
  }

  const data = (await response.json()) as TasksLocationsResponse;

  console.log(data);
  return data.locations.map((loc) => ({
    id: loc.locationId,
  }));
};

export const listTasksQueues = async (projectId: string, locationId: string): Promise<TasksQueue[]> => {
  const googleApi = useGoogleApi();
  const response = await fetch(
    `https://cloudtasks.googleapis.com/v2/projects/${projectId}/locations/${locationId}/queues`,
    {
      headers: {
        Authorization: `Bearer ${googleApi.accessToken}`,
      },
    },
  );

  console.log(googleApi.accessToken);

  if (!response.ok) {
    throw new Error(`Failed to fetch Tasks Queues: ${response.statusText}`);
  }

  const data: TasksQueuesResponse = (await response.json()) as TasksQueuesResponse;
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

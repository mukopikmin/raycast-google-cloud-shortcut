import { useEffect, useState } from "react";
import { useGoogleApi } from "../auth/google";
import { listCloudTasksQueues } from "./api";
import { CloudTasksQueue } from "./types";

type UseCloudTasksResult =
  | {
      queues: CloudTasksQueue[];
      isLoading: false;
      error: undefined;
    }
  | { queues: undefined; isLoading: true; error: undefined };

export const useCloudTasks = (projectId: string, locationId: string): UseCloudTasksResult => {
  const { accessToken } = useGoogleApi();
  const [queues, setTasks] = useState<CloudTasksQueue[] | undefined>(undefined);

  useEffect(() => {
    const load = async () => {
      const fetchedTasks = await listCloudTasksQueues(projectId, locationId, accessToken);
      setTasks(fetchedTasks);
    };

    load();
  }, [projectId, locationId]);

  return queues === undefined
    ? {
        queues: undefined,
        isLoading: true,
        error: undefined,
      }
    : {
        queues,
        isLoading: false,
        error: undefined,
      };
};

import { useEffect, useState } from "react";
import { useGoogleApi } from "../auth/google";
import { listCloudTasksQueues } from "./api";
import { CloudTasksQueue } from "./types";

type UseCloudTasksResult =
  | {
      queues: CloudTasksQueue[];
      isLoading: false;
    }
  | { queues: undefined; isLoading: true };

export const useCloudTasks = (projectId: string, locationId: string): UseCloudTasksResult => {
  const { accessToken } = useGoogleApi();
  const [queues, setTasks] = useState<CloudTasksQueue[] | undefined>();

  useEffect(() => {
    (async () => {
      const data = await listCloudTasksQueues(projectId, locationId, accessToken);
      setTasks(data);
    })();
  }, [projectId, locationId]);

  return queues === undefined
    ? {
        queues: undefined,
        isLoading: true,
      }
    : {
        queues,
        isLoading: false,
      };
};

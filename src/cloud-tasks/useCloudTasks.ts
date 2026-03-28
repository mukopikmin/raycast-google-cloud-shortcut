import { usePromise } from "@raycast/utils";
import { useGoogleApi } from "../auth/google";
import { listCloudTasksQueues } from "./api";
import { CloudTasksQueue } from "./types";

type UseCloudTasksResult =
  | {
      queues: CloudTasksQueue[];
      isLoading: boolean;
      error: undefined;
    }
  | {
      queues: undefined;
      isLoading: true;
      error: undefined;
    }
  | {
      queues: undefined;
      isLoading: false;
      error: Error;
    };

export const useCloudTasks = (projectId: string, locationId: string): UseCloudTasksResult => {
  const { accessToken } = useGoogleApi();
  const { data, isLoading, error } = usePromise(
    async (projId: string, locId: string, token: string) => {
      return await listCloudTasksQueues(projId, locId, token);
    },
    [projectId, locationId, accessToken],
  );

  if (error) {
    return { queues: undefined, isLoading: false, error };
  }

  if (!data) {
    return { queues: undefined, isLoading: true, error: undefined };
  }

  return { queues: data, isLoading, error: undefined };
};

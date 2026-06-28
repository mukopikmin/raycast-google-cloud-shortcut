import { usePromise } from "@raycast/utils";
import { useGoogleApi } from "../../auth/google";
import { listCloudTasksQueues } from "./api";
import { CloudTasksQueue } from "./types";

type SuccessResult = {
  queues: CloudTasksQueue[];
  isLoading: boolean;
  error: undefined;
};

type LoadingResult = {
  queues: undefined;
  isLoading: true;
  error: undefined;
};

type ErrorResult = {
  queues: undefined;
  isLoading: false;
  error: Error;
};

type UseCloudTasksResult = SuccessResult | LoadingResult | ErrorResult;

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

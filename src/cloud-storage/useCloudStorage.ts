import { usePromise } from "@raycast/utils";
import { useGoogleApi } from "../auth/google";
import { listCloudStorageBuckets } from "./api";
import { CloudStorageBucket } from "./types";

type UseCloudStorageResult =
  | {
      buckets: CloudStorageBucket[];
      isLoading: boolean;
      error: undefined;
    }
  | {
      buckets: undefined;
      isLoading: true;
      error: undefined;
    }
  | {
      buckets: undefined;
      isLoading: false;
      error: Error;
    };

export const useCloudStorage = (projectId: string): UseCloudStorageResult => {
  const { accessToken } = useGoogleApi();
  const { data, isLoading, error } = usePromise(
    async (projId: string, token: string) => {
      return await listCloudStorageBuckets(projId, token);
    },
    [projectId, accessToken],
  );

  if (error) {
    return { buckets: undefined, isLoading: false, error };
  }

  if (!data) {
    return { buckets: undefined, isLoading: true, error: undefined };
  }

  return { buckets: data, isLoading, error: undefined };
};

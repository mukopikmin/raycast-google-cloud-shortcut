import { useEffect, useState } from "react";
import { useGoogleApi } from "../auth/google";
import { listCloudStorageBuckets } from "./api";
import { CloudStorageBucket } from "./types";

type UseCloudStorageResult =
  | {
      buckets: CloudStorageBucket[];
      isLoading: false;
      error: undefined;
    }
  | {
      buckets: undefined;
      isLoading: true;
      error: undefined;
    };

export const useCloudStorage = (projectId: string): UseCloudStorageResult => {
  const { accessToken } = useGoogleApi();
  const [buckets, setBuckets] = useState<CloudStorageBucket[] | undefined>(undefined);

  useEffect(() => {
    const load = async () => {
      const fetchedBuckets = await listCloudStorageBuckets(projectId, accessToken);
      setBuckets(fetchedBuckets);
    };

    load();
  }, [projectId]);

  return buckets === undefined
    ? {
        buckets: undefined,
        isLoading: true,
        error: undefined,
      }
    : {
        buckets,
        isLoading: false,
        error: undefined,
      };
};

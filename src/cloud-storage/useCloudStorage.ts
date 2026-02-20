import { useEffect, useState } from "react";
import { useGoogleApi } from "../auth/google";
import { listCloudStorageBuckets } from "./api";
import { CloudStorageBucket } from "./types";

type UseCloudStorageResult =
  | {
      buckets: CloudStorageBucket[];
      isLoading: false;
    }
  | {
      buckets: undefined;
      isLoading: true;
    };

export const useCloudStorage = (projectId: string): UseCloudStorageResult => {
  const { accessToken } = useGoogleApi();
  const [buckets, setBuckets] = useState<CloudStorageBucket[] | undefined>();

  useEffect(() => {
    (async () => {
      const data = await listCloudStorageBuckets(projectId, accessToken);
      setBuckets(data);
    })();
  }, [projectId]);

  return buckets === undefined
    ? {
        buckets: undefined,
        isLoading: true,
      }
    : {
        buckets,
        isLoading: false,
      };
};

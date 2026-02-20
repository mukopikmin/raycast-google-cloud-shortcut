import { useEffect, useState } from "react";
import { useGoogleApi } from "../auth/google";
import { listStorageBuckets } from "./api";
import { StorageBucket } from "./types";

type UseStorageResult =
  | {
      buckets: StorageBucket[];
      isLoading: false;
      error: undefined;
    }
  | {
      buckets: undefined;
      isLoading: true;
      error: undefined;
    };

export const useStorage = (projectId: string): UseStorageResult => {
  const { accessToken } = useGoogleApi();
  const [buckets, setBuckets] = useState<StorageBucket[] | undefined>(undefined);

  useEffect(() => {
    const load = async () => {
      const fetchedBuckets = await listStorageBuckets(projectId, accessToken);
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

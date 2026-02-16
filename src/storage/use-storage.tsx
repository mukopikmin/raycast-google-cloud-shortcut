import { useEffect, useState } from "react";
import { listStorageBuckets, StorageBucket } from "./storage";

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
  const [buckets, setBuckets] = useState<StorageBucket[] | undefined>(undefined);

  useEffect(() => {
    const load = async () => {
      const fetchedBuckets = await listStorageBuckets(projectId);
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

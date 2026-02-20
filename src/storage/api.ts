import { fetchGoogleApi } from "../auth/api";
import { StorageBucket, StorageBucketResponse } from "./types";

/**
 * @see https://docs.cloud.google.com/storage/docs/json_api/v1/buckets/list
 */
export const listStorageBuckets = async (projectId: string, accessToken: string): Promise<StorageBucket[]> => {
  const body = await fetchGoogleApi<StorageBucketResponse>(
    `https://www.googleapis.com/storage/v1/b?project=${projectId}`,
    accessToken,
  );
  return body.items.map((item) => ({
    id: item.id,
    name: item.name,
    location: item.location,
    url: `https://console.cloud.google.com/storage/browser/${item.name}?project=${projectId}`,
  }));
};

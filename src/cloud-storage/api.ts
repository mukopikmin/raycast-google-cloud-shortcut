import { fetchGoogleApi } from "../auth/api";
import { CloudStorageBucket } from "./types";

type CloudStorageBucketResponse = {
  items?: {
    id: string;
    name: string;
    location: string;
  }[];
};

/**
 * @see https://docs.cloud.google.com/storage/docs/json_api/v1/buckets/list
 */
export const listCloudStorageBuckets = async (
  projectId: string,
  accessToken: string,
): Promise<CloudStorageBucket[]> => {
  const body = await fetchGoogleApi<CloudStorageBucketResponse>(
    `https://www.googleapis.com/storage/v1/b?project=${projectId}`,
    accessToken,
  );
  return body.items?.map((item) => ({
    id: item.id,
    name: item.name,
    location: item.location,
    url:
      `https://console.cloud.google.com/storage/browser/${item.name}?project=${projectId}`,
  })) ?? [];
};

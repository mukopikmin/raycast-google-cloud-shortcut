import { useGoogleApi } from "../auth/google";

export type StorageBucket = {
  id: string;
  name: string;
  location: string;
};

type StorageBucketResponse = {
  items: {
    id: string;
    name: string;
    location: string;
  }[];
};

/**
 * @see https://docs.cloud.google.com/storage/docs/json_api/v1/buckets/list
 */
export const listStorageBuckets = async (projectId: string): Promise<StorageBucket[]> => {
  const googleApi = useGoogleApi();
  const response = await fetch(`https://www.googleapis.com/storage/v1/b?project=${projectId}`, {
    headers: {
      Authorization: `Bearer ${googleApi.accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Storage buckets: ${response.statusText}`);
  }

  const body = (await response.json()) as StorageBucketResponse;
  return body.items.map((item) => ({
    id: item.id,
    name: item.name,
    location: item.location,
  }));
};

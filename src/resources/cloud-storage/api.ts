import { fetchGoogleApi } from "../../auth/api";
import { CloudStorageBucket } from "./types";

type CloudStorageBucketResponse = {
  items?: {
    id: string;
    name: string;
    location: string;
  }[];
  nextPageToken?: string;
};

export type CloudStorageBucketPage = {
  buckets: CloudStorageBucket[];
  nextPageToken?: string;
};

/**
 * @see https://docs.cloud.google.com/storage/docs/json_api/v1/buckets/list
 */
export const listCloudStorageBucketsPage = async (
  projectId: string,
  accessToken: string,
  options: { pageSize: number; pageToken?: string },
): Promise<CloudStorageBucketPage> => {
  const query = new URLSearchParams({
    project: projectId,
    maxResults: options.pageSize.toString(),
  });
  if (options.pageToken) {
    query.set("pageToken", options.pageToken);
  }

  const body = await fetchGoogleApi<CloudStorageBucketResponse>(
    `https://www.googleapis.com/storage/v1/b?${query.toString()}`,
    accessToken,
  );

  return {
    buckets:
      body.items?.map((item) => ({
        id: item.id,
        name: item.name,
        location: item.location,
        url: `https://console.cloud.google.com/storage/browser/${item.name}?project=${projectId}`,
      })) ?? [],
    nextPageToken: body.nextPageToken,
  };
};

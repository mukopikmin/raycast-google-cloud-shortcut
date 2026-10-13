import { useCallback } from "react";
import { useGoogleApi } from "../../auth/google";
import { usePaginatedResources } from "../../hooks/usePaginatedResources";
import { PageOptions } from "../../pagination/types";
import { listCloudStorageBucketsPage } from "./api";
import { CloudStorageBucket } from "./types";

const getResourceId = (item: CloudStorageBucket) => item.id;
const getSearchText = (item: CloudStorageBucket) => [item.name, item.location].filter(Boolean).join(" ");

const getName = (item: CloudStorageBucket) => item.name;

export const useCloudStorage = (projectId: string, searchText = "") => {
  const { accessToken } = useGoogleApi();
  const fetchPage = useCallback(
    async (options: PageOptions) => {
      const page = await listCloudStorageBucketsPage(projectId, accessToken, options);
      return { resources: page.buckets, nextPageToken: page.nextPageToken };
    },
    [projectId, accessToken],
  );
  const result = usePaginatedResources(fetchPage, getResourceId, getSearchText, searchText, getName);
  return { ...result, buckets: result.resources };
};

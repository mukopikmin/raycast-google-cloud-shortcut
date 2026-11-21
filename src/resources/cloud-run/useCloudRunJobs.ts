import { useCallback } from "react";
import { useGoogleApi } from "../../auth/google";
import { usePaginatedResources } from "../../hooks/usePaginatedResources";
import { PageOptions } from "../../pagination/types";
import { listCloudRunJobsPage } from "./api";
import { CloudRunDeployment } from "./types";

const getResourceId = (item: CloudRunDeployment) => item.id;
const getSearchText = (item: CloudRunDeployment) => item.keywords.filter(Boolean).join(" ");

const getName = (item: CloudRunDeployment) => item.name;

export const useCloudRunJobs = (projectId: string, searchText = "") => {
  const { accessToken } = useGoogleApi();
  const fetchPage = useCallback(
    async (options: PageOptions) => {
      const page = await listCloudRunJobsPage(projectId, accessToken, options);
      return { resources: page.deployments, nextPageToken: page.nextPageToken };
    },
    [projectId, accessToken],
  );
  const result = usePaginatedResources(fetchPage, getResourceId, getSearchText, searchText, getName);
  return { ...result, jobs: result.resources };
};

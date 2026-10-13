import { useCallback } from "react";
import { useGoogleApi } from "../../auth/google";
import { usePaginatedResources } from "../../hooks/usePaginatedResources";
import { PageOptions } from "../../pagination/types";
import { listCloudRunServicesPage } from "./api";
import { CloudRunDeployment } from "./types";

const getResourceId = (item: CloudRunDeployment) => item.id;
const getSearchText = (item: CloudRunDeployment) => item.keywords.join(" ");

const getName = (item: CloudRunDeployment) => item.name;

export const useCloudRunServices = (projectId: string, searchText = "") => {
  const { accessToken } = useGoogleApi();
  const fetchPage = useCallback(
    async (options: PageOptions) => {
      const page = await listCloudRunServicesPage(projectId, accessToken, options);
      return { resources: page.deployments, nextPageToken: page.nextPageToken, unreachable: page.unreachable };
    },
    [projectId, accessToken],
  );
  const result = usePaginatedResources(fetchPage, getResourceId, getSearchText, searchText, getName);
  return { ...result, services: result.resources, unreachable: result.unreachable ?? [] };
};

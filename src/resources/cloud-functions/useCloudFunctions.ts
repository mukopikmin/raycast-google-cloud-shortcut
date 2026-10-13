import { useCallback } from "react";
import { useGoogleApi } from "../../auth/google";
import { usePaginatedResources } from "../../hooks/usePaginatedResources";
import { PageOptions } from "../../pagination/types";
import { listCloudFunctionsPage } from "./api";
import { CloudFunction } from "./types";

const getResourceId = (item: CloudFunction) => item.id;
const getSearchText = (item: CloudFunction) => item.keywords.filter(Boolean).join(" ");

const getName = (item: CloudFunction) => item.name;

export const useCloudFunctions = (projectId: string, searchText = "") => {
  const { accessToken } = useGoogleApi();
  const fetchPage = useCallback(
    async (options: PageOptions) => {
      const page = await listCloudFunctionsPage(projectId, accessToken, options);
      return { resources: page.functions, nextPageToken: page.nextPageToken };
    },
    [projectId, accessToken],
  );
  const result = usePaginatedResources(fetchPage, getResourceId, getSearchText, searchText, getName);
  return { ...result, functions: result.resources };
};

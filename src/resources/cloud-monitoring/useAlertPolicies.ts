import { useCallback } from "react";
import { useGoogleApi } from "../../auth/google";
import { usePaginatedResources } from "../../hooks/usePaginatedResources";
import { PageOptions } from "../../pagination/types";
import { listAlertPoliciesPage } from "./api";
import { AlertPolicy } from "./types";

const getResourceId = (item: AlertPolicy) => item.id;
const getSearchText = (item: AlertPolicy) => item.keywords.filter(Boolean).join(" ");

export const useAlertPolicies = (projectId: string, searchText = "") => {
  const { accessToken } = useGoogleApi();
  const fetchPage = useCallback(
    async (options: PageOptions) => {
      const page = await listAlertPoliciesPage(projectId, accessToken, options);
      return { resources: page.alertPolicies, nextPageToken: page.nextPageToken };
    },
    [projectId, accessToken],
  );
  const result = usePaginatedResources(fetchPage, getResourceId, getSearchText, searchText);
  return { ...result, alertPolicies: result.resources };
};

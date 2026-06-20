import { fetchGoogleApi } from "../auth/api";
import { AlertPolicy, createAlertPolicy } from "./types";

type AlertPoliciesResponse = {
  alertPolicies?: {
    name: string;
    displayName: string;
    enabled?: boolean;
    severity?: string;
    conditions?: { displayName?: string }[];
  }[];
  nextPageToken?: string;
};

export type AlertPoliciesPage = {
  alertPolicies: AlertPolicy[];
  nextPageToken?: string;
};

/**
 * @see https://docs.cloud.google.com/monitoring/api/ref_v3/rest/v3/projects.alertPolicies/list
 */
export const listAlertPoliciesPage = async (
  projectId: string,
  accessToken: string,
  options: { pageSize: number; pageToken?: string },
): Promise<AlertPoliciesPage> => {
  const query = new URLSearchParams({ pageSize: options.pageSize.toString() });
  if (options.pageToken) {
    query.set("pageToken", options.pageToken);
  }

  const body = await fetchGoogleApi<AlertPoliciesResponse>(
    `https://monitoring.googleapis.com/v3/projects/${projectId}/alertPolicies?${query.toString()}`,
    accessToken,
  );

  return {
    alertPolicies:
      body.alertPolicies?.map((policy) =>
        createAlertPolicy({
          projectId,
          resourceName: policy.name,
          displayName: policy.displayName,
          enabled: policy.enabled,
          severity: policy.severity,
          conditionCount: policy.conditions?.length ?? 0,
          conditionNames: policy.conditions?.map((condition) => condition.displayName ?? "").filter(Boolean) ?? [],
        }),
      ) ?? [],
    nextPageToken: body.nextPageToken,
  };
};

import { fetchGoogleApi } from "../auth/api";
import { createWorkloadIdentityPool, WorkloadIdentityPool } from "./types";

type WorkloadIdentityPoolsResponse = {
  workloadIdentityPools?: {
    name: string;
    displayName?: string;
    description?: string;
    state: string;
    disabled?: boolean;
    mode?: string;
  }[];
  nextPageToken?: string;
};

export type WorkloadIdentityPoolsPage = {
  pools: WorkloadIdentityPool[];
  nextPageToken?: string;
};

/**
 * @see https://docs.cloud.google.com/iam/docs/reference/rest/v1/projects.locations.workloadIdentityPools/list
 */
export const listWorkloadIdentityPoolsPage = async (
  projectId: string,
  accessToken: string,
  options: { pageSize: number; pageToken?: string },
): Promise<WorkloadIdentityPoolsPage> => {
  const query = new URLSearchParams({ pageSize: options.pageSize.toString() });
  if (options.pageToken) {
    query.set("pageToken", options.pageToken);
  }

  const body = await fetchGoogleApi<WorkloadIdentityPoolsResponse>(
    `https://iam.googleapis.com/v1/projects/${projectId}/locations/global/workloadIdentityPools?${query.toString()}`,
    accessToken,
  );

  return {
    pools:
      body.workloadIdentityPools?.map((pool) =>
        createWorkloadIdentityPool({
          resourceName: pool.name,
          displayName: pool.displayName,
          description: pool.description,
          state: pool.state,
          disabled: pool.disabled,
          mode: pool.mode,
          projectId,
        }),
      ) ?? [],
    nextPageToken: body.nextPageToken,
  };
};

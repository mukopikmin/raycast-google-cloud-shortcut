import { useGoogleApi } from "../auth/google";

export type Sql = {
  id: string;
  region: string;
  state: string;
  url: string;
};

type SqlsResponse = {
  items: {
    name: string;
    region: string;
    state: string;
    databaseVersion: string;
    instanceType: string;
  }[];
};

/**
 * @see https://docs.cloud.google.com/sql/docs/mysql/admin-api/rest/v1beta4/instances/list
 */
export const listCloudSqls = async (projectId: string): Promise<Sql[]> => {
  const googleApi = useGoogleApi();
  const response = await fetch(`https://sqladmin.googleapis.com/sql/v1beta4/projects/${projectId}/instances`, {
    headers: { Authorization: `Bearer ${googleApi.accessToken}` },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Cloud SQL instances: ${response.statusText}`);
  }

  const body = (await response.json()) as SqlsResponse;
  const sqls = body.items.map((sql) => {
    return {
      id: sql.name,
      region: sql.region,
      state: sql.state,
      url: `https://console.cloud.google.com/sql/instances/${sql.name}/overview?project=${projectId}`,
    };
  });

  return sqls;
};

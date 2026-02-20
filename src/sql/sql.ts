import { fetchGoogleApi } from "../auth/api";

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
export const listCloudSqls = async (projectId: string, accessToken: string): Promise<Sql[]> => {
  const body = await fetchGoogleApi<SqlsResponse>(
    `https://sqladmin.googleapis.com/sql/v1beta4/projects/${projectId}/instances`,
    accessToken,
  );
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

import { useGoogleApi } from "../auth/google";

export type Sql = {
  id: string;
  region: string;
  state: string;
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

export const listCloudSqls = async (projectId: string): Promise<Sql[]> => {
  const googleApi = useGoogleApi();
  const response = await fetch(`https://sqladmin.googleapis.com/sql/v1beta4/projects/${projectId}/instances`, {
    headers: { Authorization: `Bearer ${googleApi.accesToken}` },
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
    };
  });

  return sqls;
};

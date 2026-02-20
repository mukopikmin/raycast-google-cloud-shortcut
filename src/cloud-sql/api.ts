import { fetchGoogleApi } from "../auth/api";
import { CloudSqlInstance } from "./types";

type CloudSqlInstancesResponse = {
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
export const listCloudSqlInstances = async (projectId: string, accessToken: string): Promise<CloudSqlInstance[]> => {
  const body = await fetchGoogleApi<CloudSqlInstancesResponse>(
    `https://sqladmin.googleapis.com/sql/v1beta4/projects/${projectId}/instances`,
    accessToken,
  );
  const instances = body.items.map((instance) => {
    return {
      id: instance.name,
      region: instance.region,
      state: instance.state,
      url: `https://console.cloud.google.com/sql/instances/${instance.name}/overview?project=${projectId}`,
    };
  });

  return instances;
};

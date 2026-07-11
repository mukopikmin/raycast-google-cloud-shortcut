import { fetchGoogleApi } from "../auth/api";
import { createDatastoreDatabase, DatastoreDatabase } from "./types";

type DatastoreDatabasesResponse = {
  databases?: {
    name: string;
    locationId?: string;
    type?: string;
    databaseEdition?: string;
  }[];
  unreachable?: string[];
};

/**
 * @see https://docs.cloud.google.com/firestore/docs/reference/rest/v1/projects.databases/list
 */
export const listDatastoreDatabases = async (
  projectId: string,
  accessToken: string,
): Promise<DatastoreDatabase[]> => {
  const body = await fetchGoogleApi<DatastoreDatabasesResponse>(
    `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases`,
    accessToken,
  );

  return (
    body.databases
      ?.filter((database) => database.type === "DATASTORE_MODE")
      .map((database) =>
        createDatastoreDatabase({
          projectId,
          resourceName: database.name,
          location: database.locationId,
          edition: database.databaseEdition,
        }),
      ) ?? []
  );
};

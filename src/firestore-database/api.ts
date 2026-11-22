import { fetchGoogleApi } from "../auth/api";
import { FirestoreDatabaseType, GoogleCloudDatabase } from "./types";

type FirestoreDatabasesResponse = {
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
export const listGoogleCloudDatabases = async (
  projectId: string,
  accessToken: string,
  databaseType: FirestoreDatabaseType,
): Promise<GoogleCloudDatabase[]> => {
  const body = await fetchGoogleApi<FirestoreDatabasesResponse>(
    `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases`,
    accessToken,
  );

  return (
    body.databases
      ?.filter((database) => database.type === databaseType)
      .map((database) => ({
        id: database.name.split("/").at(-1) ?? database.name,
        location: database.locationId,
        type: databaseType,
        edition: database.databaseEdition,
      })) ?? []
  );
};

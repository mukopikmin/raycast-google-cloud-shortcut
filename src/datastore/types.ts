import { GoogleCloudDatabase } from "../firestore-database/types";

export type DatastoreDatabase = {
  id: string;
  location?: string;
  edition?: string;
  url: string;
};

export const createDatastoreDatabase = (args: {
  projectId: string;
  database: GoogleCloudDatabase;
}): DatastoreDatabase => {
  const query = new URLSearchParams({
    project: args.projectId,
    database: args.database.id,
  });

  return {
    id: args.database.id,
    location: args.database.location,
    edition: args.database.edition,
    url: `https://console.cloud.google.com/datastore/entities/query?${query.toString()}`,
  };
};

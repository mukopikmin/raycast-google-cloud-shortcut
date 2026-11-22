import { GoogleCloudDatabase } from "../firestore-database/types";

export type FirestoreDatabase = {
  id: string;
  location?: string;
  edition?: string;
  url: string;
};

export const createFirestoreDatabase = (args: {
  projectId: string;
  database: GoogleCloudDatabase;
}): FirestoreDatabase => {
  const consoleDatabaseId = args.database.id === "(default)" ? "-default-" : encodeURIComponent(args.database.id);
  const query = new URLSearchParams({ project: args.projectId });

  return {
    id: args.database.id,
    location: args.database.location,
    edition: args.database.edition,
    url: `https://console.cloud.google.com/firestore/databases/${consoleDatabaseId}/data/panel?${query.toString()}`,
  };
};

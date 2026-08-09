import { useGoogleCloudDatabases } from "../firestore-database/useGoogleCloudDatabases";
import { createDatastoreDatabase } from "./types";

export const useDatastoreDatabases = (projectId: string) => {
  const { databases, isLoading, error } = useGoogleCloudDatabases(projectId, "DATASTORE_MODE");

  return {
    databases: databases?.map((database) => createDatastoreDatabase({ projectId, database })),
    isLoading,
    error,
  };
};

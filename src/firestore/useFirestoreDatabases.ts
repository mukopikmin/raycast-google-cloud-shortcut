import { useGoogleCloudDatabases } from "../firestore-database/useGoogleCloudDatabases";
import { createFirestoreDatabase } from "./types";

export const useFirestoreDatabases = (projectId: string) => {
  const { databases, isLoading, error } = useGoogleCloudDatabases(projectId, "FIRESTORE_NATIVE");

  return {
    databases: databases?.map((database) => createFirestoreDatabase({ projectId, database })),
    isLoading,
    error,
  };
};

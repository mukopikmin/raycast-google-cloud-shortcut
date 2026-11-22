import { usePromise } from "@raycast/utils";
import { useGoogleApi } from "../auth/google";
import { listGoogleCloudDatabases } from "./api";
import { FirestoreDatabaseType } from "./types";

export const useGoogleCloudDatabases = (projectId: string, databaseType: FirestoreDatabaseType) => {
  const { accessToken } = useGoogleApi();
  const { data, isLoading, error } = usePromise(listGoogleCloudDatabases, [projectId, accessToken, databaseType]);

  return { databases: data, isLoading, error };
};

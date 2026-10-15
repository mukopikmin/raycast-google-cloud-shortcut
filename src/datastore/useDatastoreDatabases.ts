import { usePromise } from "@raycast/utils";
import { useGoogleApi } from "../auth/google";
import { listDatastoreDatabases } from "./api";

export const useDatastoreDatabases = (projectId: string) => {
  const { accessToken } = useGoogleApi();
  const { data, isLoading, error } = usePromise(listDatastoreDatabases, [projectId, accessToken]);

  return { databases: data, isLoading, error };
};

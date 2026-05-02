import { usePromise } from "@raycast/utils";
import { useGoogleApi } from "../auth/google";
import { listCloudFunctions } from "./api";
import { CloudFunction } from "./types";

type UseCloudFunctionsResult =
  | {
      functions: CloudFunction[];
      isLoading: boolean;
      error: undefined;
    }
  | {
      functions: undefined;
      isLoading: true;
      error: undefined;
    }
  | {
      functions: undefined;
      isLoading: false;
      error: Error;
    };

export const useCloudFunctions = (projectId: string): UseCloudFunctionsResult => {
  const { accessToken } = useGoogleApi();
  const { data, isLoading, error } = usePromise(
    async (projId: string, token: string) => {
      return await listCloudFunctions(projId, token);
    },
    [projectId, accessToken],
  );

  if (error) {
    return { functions: undefined, isLoading: false, error };
  }

  if (!data) {
    return { functions: undefined, isLoading: true, error: undefined };
  }

  return { functions: data, isLoading, error: undefined };
};

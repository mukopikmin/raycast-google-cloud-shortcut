import { usePromise } from "@raycast/utils";
import { useGoogleApi } from "../auth/google";
import { listAppEngineServices } from "./api";
import { AppEngineService } from "./types";

type UseAppEngineServicesResult =
  | {
      services: AppEngineService[];
      isLoading: boolean;
      error: undefined;
    }
  | {
      services: undefined;
      isLoading: true;
      error: undefined;
    }
  | {
      services: undefined;
      isLoading: false;
      error: Error;
    };

export const useAppEngineServices = (projectId: string): UseAppEngineServicesResult => {
  const { accessToken } = useGoogleApi();
  const { data, isLoading, error } = usePromise(
    async (projId: string, token: string) => {
      return await listAppEngineServices(projId, token);
    },
    [projectId, accessToken],
  );

  if (error) {
    return { services: undefined, isLoading: false, error };
  }

  if (!data) {
    return { services: undefined, isLoading: true, error: undefined };
  }

  return { services: data, isLoading, error: undefined };
};

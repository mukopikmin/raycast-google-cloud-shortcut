import { usePromise } from "@raycast/utils";
import { useGoogleApi } from "../auth/google";
import { listCloudRunServices } from "./api";
import { CloudRunDeployment } from "./types";

type UseCloudRunServicesResult =
  | {
      services: CloudRunDeployment[];
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

export const useCloudRunServices = (projectId: string): UseCloudRunServicesResult => {
  const { accessToken } = useGoogleApi();
  const { data, isLoading, error } = usePromise(
    async (projId: string, token: string) => {
      return await listCloudRunServices(projId, token);
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

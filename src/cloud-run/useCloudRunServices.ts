import { usePromise } from "@raycast/utils";
import { useGoogleApi } from "../auth/google";
import { listCloudRunServices } from "./api";
import { CloudRunDeployment } from "./types";

type SuccessResult = {
  services: CloudRunDeployment[];
  isLoading: boolean;
  error: undefined;
};

type LoadingResult = {
  services: undefined;
  isLoading: true;
  error: undefined;
};

type ErrorResult = {
  services: undefined;
  isLoading: false;
  error: Error;
};

type UseCloudRunServicesResult = SuccessResult | LoadingResult | ErrorResult;

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

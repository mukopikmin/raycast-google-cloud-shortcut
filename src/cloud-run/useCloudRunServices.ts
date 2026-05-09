import { useState } from "react";
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
  const [progressiveServices, setProgressiveServices] = useState<CloudRunDeployment[]>([]);

  const { isLoading, error } = usePromise(
    async (projId: string, token: string) => {
      setProgressiveServices([]);
      return await listCloudRunServices(projId, token, (services) => {
        setProgressiveServices([...services]);
      });
    },
    [projectId, accessToken],
  );

  if (error) {
    return { services: undefined, isLoading: false, error };
  }

  if (isLoading && progressiveServices.length === 0) {
    return { services: undefined, isLoading: true, error: undefined };
  }

  return { services: progressiveServices, isLoading, error: undefined };
};

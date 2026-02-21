import { useEffect, useState } from "react";
import { useGoogleApi } from "../auth/google";
import { listCloudRunServices } from "./api";
import { CloudRunDeployment } from "./types";

type UseCloudRunServicesResult =
  | {
    services: CloudRunDeployment[];
    isLoading: false;
  }
  | {
    services: undefined;
    isLoading: true;
  };

export const useCloudRunServices = (
  projectId: string,
): UseCloudRunServicesResult => {
  const { accessToken } = useGoogleApi();
  const [services, setServices] = useState<CloudRunDeployment[] | undefined>();

  useEffect(() => {
    (async () => {
      const data = await listCloudRunServices(projectId, accessToken);
      setServices(data);
    })();
  }, [projectId]);

  return services === undefined
    ? {
      services: undefined,
      isLoading: true,
    }
    : {
      services,
      isLoading: false,
    };
};

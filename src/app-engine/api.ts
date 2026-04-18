import { fetchGoogleApi } from "../auth/api";
import { AppEngineService, createAppEngineService } from "./types";

type AppEngineServicesResponse = {
  services?: {
    id: string;
    name: string;
  }[];
};

/**
 * @see https://cloud.google.com/appengine/docs/admin-api/reference/rest/v1/apps.services/list
 */
export const listAppEngineServices = async (projectId: string, accessToken: string): Promise<AppEngineService[]> => {
  const body = await fetchGoogleApi<AppEngineServicesResponse>(
    `https://appengine.googleapis.com/v1/apps/${projectId}/services`,
    accessToken,
  );

  return (
    body.services?.map((service) => {
      // name format: apps/{projectId}/services/{serviceId}
      const parts = service.name.split("/");
      const serviceId = parts[parts.length - 1];

      return createAppEngineService({
        projectId,
        id: service.id,
        name: serviceId,
      });
    }) ?? []
  );
};

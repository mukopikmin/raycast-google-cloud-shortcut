import { fetchGoogleApi } from "../auth/api";

export type Run = {
  id: string;
  name: string;
  region: string;
  type: RunType;
  url: string;
};

type RunType = "services" | "jobs" | "worker pools";

type RunServicesResponse = {
  services: {
    name: string;
    description: string;
    uid: string;
    generation: string;
  }[];
};

export const listCloudRuns = async (projectId: string, accessToken: string): Promise<Run[]> => {
  const body = await fetchGoogleApi<RunServicesResponse>(
    `https://run.googleapis.com/v2/projects/${projectId}/locations/-/services`,
    accessToken,
  );
  const runServices = body.services.map((service) => {
    const parts = service.name.split("/");
    const region = parts[parts.length - 3];
    const name = parts[parts.length - 1];

    return {
      id: service.uid,
      name,
      region,
      type: "services" as RunType,
      url: `https://console.cloud.google.com/run/detail/${region}/${name}?project=${projectId}`,
    };
  });

  return [...runServices];
};

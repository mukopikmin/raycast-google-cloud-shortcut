import { useGoogleApi } from "../auth/google";

export type Run = {
  id: string;
  name: string;
  region: string;
  type: RunType;
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

export const listCloudRuns = async (projectId: string): Promise<Run[]> => {
  const googleApi = useGoogleApi();
  const response = await fetch(`https://run.googleapis.com/v2/projects/${projectId}/locations/-/services`, {
    headers: { Authorization: `Bearer ${googleApi.accessToken}` },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Cloud Run services: ${response.statusText}`);
  }

  const body = (await response.json()) as RunServicesResponse;
  const runServices = body.services.map((service) => {
    const parts = service.name.split("/");
    const region = parts[parts.length - 3];
    const name = parts[parts.length - 1];

    return {
      id: service.uid,
      name,
      region,
      type: "services" as RunType,
    };
  });

  return [...runServices];
};

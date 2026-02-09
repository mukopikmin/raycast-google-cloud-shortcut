import { ServicesClient } from "@google-cloud/run";

const servicesClient = new ServicesClient();

export type Run = {
  name: string;
  region: string;
  type: RunType;
};

type RunType = "services" | "jobs" | "worker pools";

export const listCloudRuns = async (projectId: string): Promise<Run[]> => {
  const parent = `projects/${projectId}/locations/-`;
  const [services] = await servicesClient.listServices({ parent });
  const runServices: Run[] = [];

  services.forEach((run) => {
    // projects/PROJECT/locations/REGION/services/SERVICE
    const parts = run.name?.split("/") ?? [];

    runServices.push({
      type: "services",
      name: parts[5] ?? "",
      region: parts[3] ?? "",
    });
  });

  return [...runServices];
};

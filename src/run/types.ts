export type Run = {
  id: string;
  name: string;
  region: string;
  type: RunType;
  url: string;
};

export type RunType = "services" | "jobs" | "worker pools";

export type RunServicesResponse = {
  services: {
    name: string;
    description: string;
    uid: string;
    generation: string;
  }[];
};

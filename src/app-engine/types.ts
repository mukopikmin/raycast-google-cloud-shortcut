import { CloudLoggingTarget } from "../actions/cloud-logging/types";

export type AppEngineService = {
  id: string;
  url: string;
  keywords: string[];
} & Extract<CloudLoggingTarget, { kind: "app-engine-service" }>;

export const createAppEngineService = (args: { projectId: string; id: string; name: string }): AppEngineService => {
  return {
    id: args.id,
    kind: "app-engine-service",
    projectId: args.projectId,
    name: args.name,
    url: `https://console.cloud.google.com/appengine/services?project=${args.projectId}&serviceId=${args.name}`,
    keywords: [args.name],
  };
};

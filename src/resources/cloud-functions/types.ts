import { CloudLoggingTarget } from "../../actions/cloud-logging/types";

export type CloudFunction = {
  id: string;
  status?: string;
  runtime?: string;
  url: string;
  keywords: string[];
} & Extract<CloudLoggingTarget, { kind: "cloud-function-gen1" }>;

export const createCloudFunction = (args: {
  projectId: string;
  id: string;
  name: string;
  region: string;
  status?: string;
  runtime?: string;
}): CloudFunction => {
  return {
    id: args.id,
    kind: "cloud-function-gen1",
    projectId: args.projectId,
    name: args.name,
    region: args.region,
    status: args.status,
    runtime: args.runtime,
    url: `https://console.cloud.google.com/functions/details/${args.region}/${args.name}?env=gen1&project=${args.projectId}`,
    keywords: [args.name, args.region, args.runtime ?? "", args.status ?? ""].filter(Boolean),
  };
};

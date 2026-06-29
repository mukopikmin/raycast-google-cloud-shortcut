import { CloudLoggingTarget } from "../../actions/cloud-logging/types";

export type Workflow = {
  name: string;
  region: string;
  description: string;
  url: string;
} & Extract<CloudLoggingTarget, { kind: "workflow" }>;

export const createWorkflow = (args: Omit<Workflow, "kind" | "url"> & { projectId: string }): Workflow => {
  return {
    ...args,
    kind: "workflow",
    url: `https://console.cloud.google.com/workflows/workflow/${args.region}/${args.name}?project=${args.projectId}`,
  };
};

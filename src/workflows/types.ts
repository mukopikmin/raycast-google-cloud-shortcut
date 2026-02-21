export type Workflow = {
  name: string;
  region: string;
  description: string;
  url: string;
};

export const createWorkflow = (args: Omit<Workflow, "url"> & { projectId: string }): Workflow => {
  return {
    ...args,
    url: `https://console.cloud.google.com/workflows/workflows/${args.region}/${args.name}?project=${args.projectId}`,
  };
};

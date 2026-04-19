export type Workflow = {
  name: string;
  region: string;
  description: string;
  url: string;
};

export const createWorkflow = (args: Omit<Workflow, "url"> & { projectId: string }): Workflow => {
  return {
    ...args,
    url: `https://console.cloud.google.com/workflows/workflow/${args.region}/${args.name}/overview?project=${args.projectId}`,
  };
};

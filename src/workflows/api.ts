import { fetchGoogleApi } from "../auth/api";
import { createWorkflow, Workflow } from "./types";

type WorkflowsResponse = {
  workflows: {
    name: string;
    description: string;
  }[];
};

export const listWorkflows = async (projectId: string, accessToken: string): Promise<Workflow[]> => {
  const body = await fetchGoogleApi<WorkflowsResponse>(
    `https://workflows.googleapis.com/v1/projects/${projectId}/locations/-/workflows`,
    accessToken,
  );

  console.log(body);

  return body.workflows?.map((workflow) => {
    // projects/{project}/locations/{region}/workflows/{workflowId}
    const parts = workflow.name.split("/");
    const region = parts[parts.length - 3];
    const name = parts[parts.length - 1];

    return createWorkflow({
      projectId,
      name,
      region,
      description: workflow.description,
    });
  });
};

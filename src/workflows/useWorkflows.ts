import { usePromise } from "@raycast/utils";
import { listWorkflows } from "./api";
import { Workflow } from "./types";
import { useGoogleApi } from "../auth/google";

type UseWorkflowsResult =
  | {
      workflows: Workflow[];
      isLoading: boolean;
      error: undefined;
    }
  | {
      workflows: undefined;
      isLoading: true;
      error: undefined;
    }
  | {
      workflows: undefined;
      isLoading: false;
      error: Error;
    };

export const useWorkflows = (projectId: string): UseWorkflowsResult => {
  const { accessToken } = useGoogleApi();
  const { data, isLoading, error } = usePromise(
    async (projId: string, token: string) => {
      return await listWorkflows(projId, token);
    },
    [projectId, accessToken],
  );

  if (error) {
    return { workflows: undefined, isLoading: false, error };
  }

  if (!data) {
    return { workflows: undefined, isLoading: true, error: undefined };
  }

  return { workflows: data, isLoading, error: undefined };
};

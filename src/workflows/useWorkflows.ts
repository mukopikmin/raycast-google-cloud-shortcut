import { listWorkflows } from "./api";
import { Workflow } from "./types";
import { useEffect, useState } from "react";
import { useGoogleApi } from "../auth/google";

type UseWorkflowsResult =
  | {
      workflows: Workflow[];
      isLoading: false;
    }
  | {
      workflows: undefined;
      isLoading: true;
    };

export const useWorkflows = (projectId: string): UseWorkflowsResult => {
  const { accessToken } = useGoogleApi();
  const [workflows, setWorkflows] = useState<Workflow[] | undefined>();

  useEffect(() => {
    const fetchWorkflows = async () => {
      try {
        const workflows = await listWorkflows(projectId, accessToken);
        setWorkflows(workflows);
      } catch (error) {
        console.error(error);
      }
    };
    fetchWorkflows();
  }, []);

  return workflows === undefined
    ? {
        workflows: undefined,
        isLoading: true,
      }
    : {
        workflows,
        isLoading: false,
      };
};

import { usePromise } from "@raycast/utils";
import { useGoogleApi } from "../auth/google";
import { listForwardingRules } from "./api";
import { ForwardingRule } from "./types";

type UseForwardingRulesResult =
  | {
      forwardingRules: ForwardingRule[];
      isLoading: boolean;
      error: undefined;
    }
  | {
      forwardingRules: undefined;
      isLoading: true;
      error: undefined;
    }
  | {
      forwardingRules: undefined;
      isLoading: false;
      error: Error;
    };

export const useForwardingRules = (projectId: string): UseForwardingRulesResult => {
  const { accessToken } = useGoogleApi();
  const { data, isLoading, error } = usePromise(
    async (projId: string, token: string) => {
      return await listForwardingRules(projId, token);
    },
    [projectId, accessToken],
  );

  if (error) {
    return { forwardingRules: undefined, isLoading: false, error };
  }

  if (!data) {
    return { forwardingRules: undefined, isLoading: true, error: undefined };
  }

  return { forwardingRules: data, isLoading, error: undefined };
};

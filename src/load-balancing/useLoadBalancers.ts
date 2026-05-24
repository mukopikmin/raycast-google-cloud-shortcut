import { usePromise } from "@raycast/utils";
import { useGoogleApi } from "../auth/google";
import { listLoadBalancers } from "./api";
import { LoadBalancerResource } from "./types";

type UseLoadBalancersResult =
  | {
      resources: LoadBalancerResource[];
      isLoading: boolean;
      error: undefined;
    }
  | {
      resources: undefined;
      isLoading: true;
      error: undefined;
    }
  | {
      resources: undefined;
      isLoading: false;
      error: Error;
    };

export const useLoadBalancers = (projectId: string): UseLoadBalancersResult => {
  const { accessToken } = useGoogleApi();
  const { data, isLoading, error } = usePromise(
    async (projId: string, token: string) => {
      return await listLoadBalancers(projId, token);
    },
    [projectId, accessToken],
  );

  if (error) {
    return { resources: undefined, isLoading: false, error };
  }

  if (!data) {
    return { resources: undefined, isLoading: true, error: undefined };
  }

  return { resources: data, isLoading, error: undefined };
};

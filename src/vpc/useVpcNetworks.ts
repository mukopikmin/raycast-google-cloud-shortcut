import { usePromise } from "@raycast/utils";
import { useGoogleApi } from "../auth/google";
import { listVpcNetworks } from "./api";
import { VpcNetwork } from "./types";

type UseVpcNetworksResult =
  | {
      networks: VpcNetwork[];
      isLoading: boolean;
      error: undefined;
    }
  | {
      networks: undefined;
      isLoading: true;
      error: undefined;
    }
  | {
      networks: undefined;
      isLoading: false;
      error: Error;
    };

export const useVpcNetworks = (projectId: string): UseVpcNetworksResult => {
  const { accessToken } = useGoogleApi();
  const { data, isLoading, error } = usePromise(
    async (projId: string, token: string) => {
      return await listVpcNetworks(projId, token);
    },
    [projectId, accessToken],
  );

  if (error) {
    return { networks: undefined, isLoading: false, error };
  }

  if (!data) {
    return { networks: undefined, isLoading: true, error: undefined };
  }

  return { networks: data, isLoading, error: undefined };
};

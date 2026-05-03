import { usePromise } from "@raycast/utils";
import { useGoogleApi } from "../auth/google";
import { fetchIamPolicies } from "./api";

export const useIamPolicies = (projectId: string) => {
  const { accessToken } = useGoogleApi();
  const { data, isLoading, error } = usePromise(fetchIamPolicies, [projectId, accessToken]);

  return { iamMemberRoles: data, isLoading, error };
};

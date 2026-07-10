import { usePromise } from "@raycast/utils";
import { useGoogleApi } from "../../auth/google";
import { listCloudBuilds } from "./api";
import { CloudBuild } from "./types";

type SuccessResult = {
  builds: CloudBuild[];
  isLoading: boolean;
  error: undefined;
};

type LoadingResult = {
  builds: undefined;
  isLoading: true;
  error: undefined;
};

type ErrorResult = {
  builds: undefined;
  isLoading: false;
  error: Error;
};

type UseCloudBuildsResult = SuccessResult | LoadingResult | ErrorResult;

export const useCloudBuilds = (projectId: string): UseCloudBuildsResult => {
  const { accessToken } = useGoogleApi();
  const { data, isLoading, error } = usePromise(
    async (projId: string, token: string) => {
      return await listCloudBuilds(projId, token);
    },
    [projectId, accessToken],
  );

  if (error) {
    return { builds: undefined, isLoading: false, error };
  }

  if (!data) {
    return { builds: undefined, isLoading: true, error: undefined };
  }

  return { builds: data, isLoading, error: undefined };
};

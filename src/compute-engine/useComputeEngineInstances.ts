import { useState } from "react";
import { usePromise } from "@raycast/utils";
import { useGoogleApi } from "../auth/google";
import { listComputeEngineInstances } from "./api";
import { ComputeEngineInstance } from "./types";

type SuccessResult = {
  instances: ComputeEngineInstance[];
  isLoading: boolean;
  error: undefined;
};

type LoadingResult = {
  instances: undefined;
  isLoading: true;
  error: undefined;
};

type ErrorResult = {
  instances: undefined;
  isLoading: false;
  error: Error;
};

type UseComputeEngineInstancesResult = SuccessResult | LoadingResult | ErrorResult;

export const useComputeEngineInstances = (projectId: string): UseComputeEngineInstancesResult => {
  const { accessToken } = useGoogleApi();
  const [progressiveInstances, setProgressiveInstances] = useState<ComputeEngineInstance[]>([]);

  const { isLoading, error } = usePromise(
    async (projId: string, token: string) => {
      setProgressiveInstances([]);
      return await listComputeEngineInstances(projId, token, (instances) => {
        setProgressiveInstances([...instances]);
      });
    },
    [projectId, accessToken],
  );

  if (error) {
    return { instances: undefined, isLoading: false, error };
  }

  if (isLoading && progressiveInstances.length === 0) {
    return { instances: undefined, isLoading: true, error: undefined };
  }

  return { instances: progressiveInstances, isLoading, error: undefined };
};

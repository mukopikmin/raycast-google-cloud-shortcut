import { usePromise } from "@raycast/utils";
import { useGoogleApi } from "../auth/google";
import { listErrorGroups } from "./api";
import { ErrorGroupStats, ResolutionStatus } from "./types";

type SuccessResult = {
  errorGroups: ErrorGroupStats[];
  isLoading: boolean;
  error: undefined;
};

type LoadingResult = {
  errorGroups: undefined;
  isLoading: true;
  error: undefined;
};

type ErrorResult = {
  errorGroups: undefined;
  isLoading: false;
  error: Error;
};

type UseErrorReportingResult = SuccessResult | LoadingResult | ErrorResult;

export const useErrorReporting = (projectId: string): UseErrorReportingResult => {
  const { accessToken } = useGoogleApi();
  const { data, isLoading, error } = usePromise(
    async (projId: string, token: string) => {
      return await listErrorGroups(projId, token);
    },
    [projectId, accessToken],
  );

  if (error) {
    return { errorGroups: undefined, isLoading: false, error };
  }

  if (!data) {
    return { errorGroups: undefined, isLoading: true, error: undefined };
  }

  const allowedStatuses: Set<ResolutionStatus> = new Set(["OPEN", "ACKNOWLEDGED", "RESOLUTION_STATUS_UNSPECIFIED"]);

  const filteredGroups = data.filter((stat) => {
    const status = stat.group.resolutionStatus;
    return !status || allowedStatuses.has(status);
  });

  return { errorGroups: filteredGroups, isLoading, error: undefined };
};

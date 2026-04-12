import { usePromise } from "@raycast/utils";
import { useGoogleApi } from "../auth/google";
import { listErrorGroups } from "./api";
import { ErrorGroupStats } from "./types";

type UseErrorReportingResult =
  | {
      errorGroups: ErrorGroupStats[];
      isLoading: boolean;
      error: undefined;
    }
  | {
      errorGroups: undefined;
      isLoading: true;
      error: undefined;
    }
  | {
      errorGroups: undefined;
      isLoading: false;
      error: Error;
    };

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

  const filteredGroups = data.filter((stat) => {
    const status = stat.group.resolutionStatus;
    // Filter for OPEN and ACKNOWLEDGED. RESOLUTION_STATUS_UNSPECIFIED is treated as OPEN.
    return !status || status === "OPEN" || status === "ACKNOWLEDGED" || status === "RESOLUTION_STATUS_UNSPECIFIED";
  });

  return { errorGroups: filteredGroups, isLoading, error: undefined };
};

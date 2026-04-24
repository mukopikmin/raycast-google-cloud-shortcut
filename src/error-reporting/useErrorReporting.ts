import { usePromise } from "@raycast/utils";
import { useGoogleApi } from "../auth/google";
import { listErrorGroups } from "./api";
import { ErrorGroupStats, ResolutionStatus } from "./types";

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

  const allowedStatuses: Set<ResolutionStatus> = new Set(["OPEN", "ACKNOWLEDGED", "RESOLUTION_STATUS_UNSPECIFIED"]);

  const filteredGroups = data
    .filter((stat) => {
      const status = stat.group.resolutionStatus;
      return !status || allowedStatuses.has(status);
    })
    .sort((a, b) => {
      const countA = Number(a.count ?? 0);
      const countB = Number(b.count ?? 0);
      return countB - countA;
    });

  return { errorGroups: filteredGroups, isLoading, error: undefined };
};

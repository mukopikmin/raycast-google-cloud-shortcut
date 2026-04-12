import { fetchGoogleApi } from "../auth/api";
import {
  ErrorGroupStats,
  ServiceContext,
  TimedCount,
  ErrorContext,
  TrackingIssue,
  ResolutionStatus,
} from "./types";

type ErrorGroupStatsResponse = {
  group: {
    groupId: string;
    name: string;
    trackingIssues?: TrackingIssue[];
    resolutionStatus?: ResolutionStatus;
  };
  count: string;
  affectedUsersCount: string;
  representative: {
    message: string;
    eventTime?: string;
    serviceContext?: ServiceContext;
    context?: ErrorContext;
  };
  firstSeenTime: string;
  lastSeenTime: string;
  numAffectedServices: number;
  affectedServices: ServiceContext[];
  timedCounts: TimedCount[];
};

type GroupStatsResponse = {
  errorGroupStats?: ErrorGroupStatsResponse[];
};

export const listErrorGroups = async (projectId: string, accessToken: string): Promise<ErrorGroupStats[]> => {
  const apiUrl = new URL(`https://clouderrorreporting.googleapis.com/v1beta1/projects/${projectId}/groupStats`);
  apiUrl.searchParams.append("timeRange.period", "PERIOD_1_WEEK");
  // Request timed counts with 1-day granularity
  apiUrl.searchParams.append("timedCountDuration", "86400s");

  const body = await fetchGoogleApi<GroupStatsResponse>(apiUrl.toString(), accessToken);

  return (body.errorGroupStats ?? []).map((stat) => ({
    ...stat,
    affectedServices: stat.affectedServices ?? [],
    timedCounts: stat.timedCounts ?? [],
    numAffectedServices: stat.numAffectedServices ?? 0,
    url: `https://console.cloud.google.com/errors/${stat.group.groupId}?project=${projectId}`,
  }));
};

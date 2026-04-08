import { fetchGoogleApi } from "../auth/api";
import { ErrorGroupStats } from "./types";

type ErrorGroupStatsResponse = {
  group: {
    groupId: string;
    name: string;
  };
  count: string;
  affectedUsersCount: string;
  representative: {
    message: string;
  };
  firstSeenTime: string;
  lastSeenTime: string;
};

type GroupStatsResponse = {
  errorGroupStats?: ErrorGroupStatsResponse[];
};

export const listErrorGroups = async (projectId: string, accessToken: string): Promise<ErrorGroupStats[]> => {
  const apiUrl = new URL(`https://clouderrorreporting.googleapis.com/v1beta1/projects/${projectId}/groupStats`);
  // Default to past 1 week as initially requested
  apiUrl.searchParams.append("timeRange.period", "PERIOD_1_WEEK");

  const body = await fetchGoogleApi<GroupStatsResponse>(apiUrl.toString(), accessToken);

  return (body.errorGroupStats ?? []).map((stat) => ({
    ...stat,
    url: `https://console.cloud.google.com/errors/${stat.group.groupId}?project=${projectId}`,
  }));
};

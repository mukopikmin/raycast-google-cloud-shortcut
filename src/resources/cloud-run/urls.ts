export const createCloudRunRevisionsUrl = (projectId: string, region: string, name: string): string => {
  return `https://console.cloud.google.com/run/detail/${region}/${name}/revisions?project=${projectId}`;
};

export const createCloudRunExecutionsUrl = (projectId: string, region: string, name: string): string => {
  return `https://console.cloud.google.com/run/jobs/details/${region}/${name}/executions?project=${projectId}`;
};

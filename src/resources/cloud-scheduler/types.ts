export type CloudSchedulerJob = {
  name: string;
  region: string;
  schedule: string;
  timeZone: string;
  description: string;
  url: string;
};

export const createCloudSchedulerJob = (
  args: Omit<CloudSchedulerJob, "url"> & { projectId: string },
): CloudSchedulerJob => {
  return {
    ...args,
    url: `https://console.cloud.google.com/cloudscheduler/jobs/edit/${args.region}/${args.name}?project=${args.projectId}`,
  };
};

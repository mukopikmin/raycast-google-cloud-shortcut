export type CloudBuildStatus =
  | "STATUS_UNKNOWN"
  | "QUEUED"
  | "WORKING"
  | "SUCCESS"
  | "FAILURE"
  | "INTERNAL_ERROR"
  | "TIMEOUT"
  | "CANCELLED"
  | "EXPIRED"
  | "PENDING";

export type CloudBuild = {
  id: string;
  status: CloudBuildStatus;
  createTime: string;
  startTime?: string;
  finishTime?: string;
  triggerName?: string;
  url: string;
  keywords: string[];
};

export const createCloudBuild = (args: {
  id: string;
  projectId: string;
  status: CloudBuildStatus;
  createTime: string;
  startTime?: string;
  finishTime?: string;
  triggerName?: string;
  region: string;
}): CloudBuild => {
  const buildId = args.id;
  const region = args.region || "global";

  return {
    id: args.id,
    status: args.status,
    createTime: args.createTime,
    startTime: args.startTime,
    finishTime: args.finishTime,
    triggerName: args.triggerName,
    url: `https://console.cloud.google.com/cloud-build/builds;region=${region}/${buildId}?project=${args.projectId}`,
    keywords: [buildId, args.status, args.triggerName ?? ""].filter(Boolean),
  };
};

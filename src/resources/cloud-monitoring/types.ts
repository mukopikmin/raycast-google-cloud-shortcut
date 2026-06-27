export type AlertPolicy = {
  id: string;
  displayName: string;
  enabled?: boolean;
  severity?: string;
  conditionCount: number;
  url: string;
  keywords: string[];
};

export const createAlertPolicy = (args: {
  projectId: string;
  resourceName: string;
  displayName: string;
  enabled?: boolean;
  severity?: string;
  conditionCount: number;
  conditionNames: string[];
}): AlertPolicy => {
  const id = args.resourceName.split("/").at(-1) ?? args.resourceName;

  return {
    id,
    displayName: args.displayName,
    enabled: args.enabled,
    severity: args.severity,
    conditionCount: args.conditionCount,
    url: `https://console.cloud.google.com/monitoring/alerting/policies/${id}?project=${args.projectId}`,
    keywords: [id, args.displayName, args.severity ?? "", ...args.conditionNames].filter(Boolean),
  };
};

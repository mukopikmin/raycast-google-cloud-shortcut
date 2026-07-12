export type WorkloadIdentityPool = {
  id: string;
  name: string;
  description?: string;
  state: string;
  disabled: boolean;
  mode?: string;
  url: string;
  keywords: string[];
};

export const createWorkloadIdentityPool = (args: {
  resourceName: string;
  displayName?: string;
  description?: string;
  state: string;
  disabled?: boolean;
  mode?: string;
  projectId: string;
}): WorkloadIdentityPool => {
  const id = args.resourceName.split("/").pop() || args.resourceName;
  const name = args.displayName || id;

  return {
    id,
    name,
    description: args.description,
    state: args.state,
    disabled: args.disabled ?? false,
    mode: args.mode,
    url: `https://console.cloud.google.com/iam-admin/workload-identity-pools/pool/${encodeURIComponent(id)}?project=${encodeURIComponent(args.projectId)}`,
    keywords: [id, name, args.description, args.state, args.mode].filter((value): value is string => Boolean(value)),
  };
};

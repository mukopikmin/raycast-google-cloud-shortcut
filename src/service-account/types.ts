export type ServiceAccount = {
  id: string;
  name: string;
  email: string;
  url: string;
  keywords: string[];
};

export const createServiceAccount = (args: {
  id: string;
  name: string;
  email: string;
  projectId: string;
}): ServiceAccount => {
  return {
    id: args.id,
    name: args.name,
    email: args.email,
    url: `https://console.cloud.google.com/iam-admin/serviceaccounts/details/${args.id}?project=${args.projectId}`,
    keywords: [args.id, args.name, args.email],
  };
};

export type AppEngineService = {
  id: string;
  name: string;
  url: string;
  keywords: string[];
};

export const createAppEngineService = (args: {
  projectId: string;
  id: string;
  name: string;
}): AppEngineService => {
  return {
    id: args.id,
    name: args.name,
    url: `https://console.cloud.google.com/appengine/services?project=${args.projectId}&serviceId=${args.name}`,
    keywords: [args.name],
  };
};

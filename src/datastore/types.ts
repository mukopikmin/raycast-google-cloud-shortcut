export type DatastoreDatabase = {
  id: string;
  location?: string;
  edition?: string;
  url: string;
};

export const createDatastoreDatabase = (args: {
  projectId: string;
  resourceName: string;
  location?: string;
  edition?: string;
}): DatastoreDatabase => {
  const id = args.resourceName.split("/").at(-1) ?? args.resourceName;
  const query = new URLSearchParams({
    project: args.projectId,
    database: id,
  });

  return {
    id,
    location: args.location,
    edition: args.edition,
    url: `https://console.cloud.google.com/datastore/entities/query?${query.toString()}`,
  };
};

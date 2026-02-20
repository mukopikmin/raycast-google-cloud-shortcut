export type Sql = {
  id: string;
  region: string;
  state: string;
  url: string;
};

export type SqlsResponse = {
  items: {
    name: string;
    region: string;
    state: string;
    databaseVersion: string;
    instanceType: string;
  }[];
};

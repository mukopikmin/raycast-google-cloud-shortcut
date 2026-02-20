export type AlloyDbCluster = {
  id: string;
  name: string;
  region: string;
  state: string;
  url: string;
};

export type AlloyDbClustersResponse = {
  clusters: {
    uid: string;
    name: string;
    displayName: string;
    state: string;
  }[];
};

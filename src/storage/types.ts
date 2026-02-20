export type StorageBucket = {
  id: string;
  name: string;
  location: string;
  url: string;
};

export type StorageBucketResponse = {
  items: {
    id: string;
    name: string;
    location: string;
  }[];
};

export type TasksQueue = {
  name: string;
  region: string;
  state: string;
  url: string;
};

export type TasksQueuesResponse = {
  queues: {
    name: string;
    state: string;
  }[];
};

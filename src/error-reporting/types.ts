export type ErrorGroupStats = {
  group: {
    groupId: string;
    name: string;
  };
  count: string;
  affectedUsersCount: string;
  representative: {
    message: string;
  };
  firstSeenTime: string;
  lastSeenTime: string;
  url: string;
};

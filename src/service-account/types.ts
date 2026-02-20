export type ServiceAccount = {
  id: string;
  name: string;
  email: string;
  url: string;
};

export type ServiceAccountListResponse = {
  accounts: {
    uniqueId: string;
    displayName: string;
    email: string;
  }[];
};

export type IamBinding = {
  role: string;
  members: string[];
};

export type IamPolicy = {
  version?: number;
  bindings?: IamBinding[];
  etag?: string;
};

export type IamMemberRole = {
  id: string;
  member: string;
  role: string;
  url: string;
};

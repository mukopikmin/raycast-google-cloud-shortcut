export type Project = {
  id: string;
  name: string;
};

export type ProjectResponse = {
  projects: Array<{
    projectNumber: string;
    projectId: string;
    lifecycleState: string;
    name: string;
    createTime: string;
    labels?: {
      firebase: string;
    };
  }>;
};

import { LocalStorage } from "@raycast/api";
import { fetchGoogleApi } from "../auth/api";

const CACHE_KEY_PROJECTS = "projects";

export type Project = {
  id: string;
  name: string;
};

type ProjectResponse = {
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

export const listProjects = async (accessToken: string) => {
  const body = await fetchGoogleApi<ProjectResponse>(
    "https://cloudresourcemanager.googleapis.com/v1/projects",
    accessToken,
  );

  return body.projects.map((project) => {
    return {
      id: project.projectId,
      name: project.name,
    };
  });
};

export const listCachedProjects = async () => {
  const cachedProjects = await LocalStorage.getItem<string>(CACHE_KEY_PROJECTS);

  if (cachedProjects === undefined) {
    return undefined;
  }

  return JSON.parse(cachedProjects) as Project[];
};

export const cacheProjects = async (projects: Project[]) => {
  await LocalStorage.setItem(CACHE_KEY_PROJECTS, JSON.stringify(projects));
};

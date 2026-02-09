import { ProjectsClient } from "@google-cloud/resource-manager";
import { LocalStorage } from "@raycast/api";

const CACHE_KEY_PROJECTS = "projects";

const client = new ProjectsClient();

export type Project = {
  id: string;
  name: string;
};

export const listProjects = async () => {
  const projects: Project[] = [];
  const iterable = client.searchProjectsAsync({});

  for await (const project of iterable) {
    projects.push({
      id: project.projectId ?? "",
      name: project.displayName ?? "",
    });
  }

  return projects;
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

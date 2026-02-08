import { ProjectsClient } from "@google-cloud/resource-manager";
import { LocalStorage } from "@raycast/api";

const CACHE_KEY_PROJECTS = "projects";

export type Project = {
  id: string;
  name: string;
};

export async function listProjects() {
  const client = new ProjectsClient();

  const projects: Project[] = [];
  const iterable = client.searchProjectsAsync({});

  for await (const project of iterable) {
    projects.push({
      id: project.projectId ?? "",
      name: project.displayName ?? "",
    });
  }

  return projects;
}

export async function listCachedProjects() {
  const cachedProjects = await LocalStorage.getItem<string>(CACHE_KEY_PROJECTS);

  if (cachedProjects === undefined) {
    return undefined;
  }

  return JSON.parse(cachedProjects) as Project[];
}

export async function cacheProjects(projects: Project[]) {
  await LocalStorage.setItem(CACHE_KEY_PROJECTS, JSON.stringify(projects));
}

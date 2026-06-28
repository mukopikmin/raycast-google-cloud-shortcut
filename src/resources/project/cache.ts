import { LocalStorage } from "@raycast/api";
import { Project } from "./types";

const CACHE_KEY_PROJECTS = "projects";

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

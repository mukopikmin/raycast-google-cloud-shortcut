import { fetchGoogleApi } from "../auth/api";
import { ProjectResponse } from "./types";

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

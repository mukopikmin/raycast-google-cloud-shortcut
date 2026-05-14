import { useEffect, useState } from "react";
import { listCachedProjects } from "./cache";
import { Project } from "./types";

type LoadingResult = {
  projects: undefined;
  isLoading: true;
};

type SuccessResult = {
  projects: Project[];
  isLoading: false;
};

type UseProjectsResult = LoadingResult | SuccessResult;

export const useProjects = (): UseProjectsResult => {
  const [projects, setProjects] = useState<Project[] | undefined>();

  useEffect(() => {
    (async () => {
      const cachedProjects = await listCachedProjects();
      setProjects(cachedProjects);
    })();
  }, []);

  return projects === undefined
    ? {
        projects: undefined,
        isLoading: true,
      }
    : {
        projects,
        isLoading: false,
      };
};

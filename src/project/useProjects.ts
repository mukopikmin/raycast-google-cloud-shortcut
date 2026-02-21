import { useEffect, useState } from "react";
import { listCachedProjects } from "./cache";
import { Project } from "./types";

type UseProjectsResult =
  | {
      projects: undefined;
      isLoading: true;
    }
  | {
      projects: Project[];
      isLoading: false;
    };

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

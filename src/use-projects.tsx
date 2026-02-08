import { useEffect, useState } from "react";
import { cacheProjects, listCachedProjects, listProjects, Project } from "./project";

type UseProjectsResult =
  | {
      projects: Project[];
      isLoading: false;
      updateProjects: () => void;
    }
  | {
      projects: undefined;
      isLoading: true;
      updateProjects: () => void;
    };

export const useProjects = (): UseProjectsResult => {
  const [projects, setProjects] = useState<Project[] | undefined>();
  const updateProjects = async () => {
    const fetchedProjects = await listProjects();
    cacheProjects(fetchedProjects);
    setProjects(fetchedProjects);
  };

  useEffect(() => {
    const fetch = async () => {
      const cachedProjects = await listCachedProjects();

      if (cachedProjects === undefined) {
        updateProjects();
      } else {
        setProjects(cachedProjects);
      }
    };

    fetch();
  }, []);

  return projects === undefined
    ? {
        projects: undefined,
        isLoading: true,
        updateProjects,
      }
    : {
        projects,
        updateProjects,
        isLoading: false,
      };
};

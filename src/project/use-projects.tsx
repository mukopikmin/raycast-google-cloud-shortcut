import { useEffect, useState } from "react";
import { cacheProjects, listCachedProjects, listProjects, Project } from "./project";

type UseProjectsResult = (UpdateProjectResultLoading | UpdateProjectResultLoaded) & {
  updateProjects: () => void;
};

type UpdateProjectResultLoading = {
  projects: undefined;
  isLoading: true;
};

type UpdateProjectResultLoaded = {
  projects: Project[];
  isLoading: false;
};

export const useProjects = (): UseProjectsResult => {
  const [projects, setProjects] = useState<Project[] | undefined>();
  const updateProjects = async () => {
    setProjects(undefined);

    const fetchedProjects = await listProjects();
    cacheProjects(fetchedProjects);
    setProjects(fetchedProjects);
  };

  useEffect(() => {
    const load = async () => {
      const cachedProjects = await listCachedProjects();

      if (cachedProjects === undefined) {
        updateProjects();
      } else {
        setProjects(cachedProjects);
      }
    };

    load();
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

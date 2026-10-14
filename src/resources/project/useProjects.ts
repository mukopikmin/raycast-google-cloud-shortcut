import { useCallback, useEffect, useState } from "react";
import { getAccessToken } from "@raycast/utils";
import { launchAuthenticatedCommand } from "../../auth/launch";
import { listProjects } from "./api";
import { cacheProjects, listCachedProjects } from "./cache";
import { Project } from "./types";

type LoadingResult = {
  projects: undefined;
  isLoading: true;
  error: undefined;
  refreshProjects: () => Promise<void>;
};

type SuccessResult = {
  projects: Project[];
  isLoading: false;
  error: undefined;
  refreshProjects: () => Promise<void>;
};

type ErrorResult = {
  projects: undefined;
  isLoading: false;
  error: Error;
  refreshProjects: () => Promise<void>;
};

type UseProjectsResult = LoadingResult | SuccessResult | ErrorResult;

export const useProjects = (refreshOnLoad = false): UseProjectsResult => {
  const [projects, setProjects] = useState<Project[] | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>();

  const refreshProjects = useCallback(async () => {
    setIsLoading(true);
    setError(undefined);

    try {
      await launchAuthenticatedCommand({ type: "refresh-projects" });
    } catch (error) {
      setProjects(undefined);
      setError(error instanceof Error ? error : new Error(String(error)));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      setError(undefined);

      try {
        if (refreshOnLoad) {
          const { token: accessToken } = getAccessToken();
          const fetchedProjects = await listProjects(accessToken);
          await cacheProjects(fetchedProjects);
          setProjects(fetchedProjects);
          setIsLoading(false);
          return;
        }

        const cachedProjects = await listCachedProjects();

        if (cachedProjects !== undefined) {
          setProjects(cachedProjects);
          setIsLoading(false);
          return;
        }

        await refreshProjects();
      } catch (error) {
        setProjects(undefined);
        setError(error instanceof Error ? error : new Error(String(error)));
        setIsLoading(false);
      }
    })();
  }, [refreshOnLoad, refreshProjects]);

  if (error) {
    return {
      projects: undefined,
      isLoading: false,
      error,
      refreshProjects,
    };
  }

  return isLoading
    ? {
        projects: undefined,
        isLoading: true,
        error: undefined,
        refreshProjects,
      }
    : {
        projects: projects ?? [],
        isLoading: false,
        error: undefined,
        refreshProjects,
      };
};

import { useCallback, useEffect, useState } from "react";
import { listProjects } from "./api";
import { cacheProjects, listCachedProjects } from "./cache";
import { Project } from "./types";

type LoadingResult = {
  projects: undefined;
  isLoading: true;
  error: undefined;
  requiresAuthentication: false;
  refreshProjects: () => Promise<void>;
};

type SuccessResult = {
  projects: Project[];
  isLoading: false;
  error: undefined;
  requiresAuthentication: false;
  refreshProjects: () => Promise<void>;
};

type ErrorResult = {
  projects: undefined;
  isLoading: false;
  error: Error;
  requiresAuthentication: false;
  refreshProjects: () => Promise<void>;
};

type AuthenticationRequiredResult = {
  projects: undefined;
  isLoading: false;
  error: undefined;
  requiresAuthentication: true;
  refreshProjects: () => Promise<void>;
};

export type UseProjectsResult = LoadingResult | SuccessResult | ErrorResult | AuthenticationRequiredResult;

type UseProjectsOptions = {
  accessToken?: string;
  skipCache?: boolean;
};

export const useProjects = ({ accessToken, skipCache = false }: UseProjectsOptions = {}): UseProjectsResult => {
  const [projects, setProjects] = useState<Project[] | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>();
  const [requiresAuthentication, setRequiresAuthentication] = useState(false);

  const refreshProjects = useCallback(async () => {
    if (!accessToken) {
      setRequiresAuthentication(true);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(undefined);
    setRequiresAuthentication(false);

    try {
      const fetchedProjects = await listProjects(accessToken);
      await cacheProjects(fetchedProjects);
      setProjects(fetchedProjects);
    } catch (error) {
      setProjects(undefined);
      setError(error instanceof Error ? error : new Error(String(error)));
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      setError(undefined);

      try {
        if (skipCache) {
          await refreshProjects();
          return;
        }

        const cachedProjects = await listCachedProjects();

        if (cachedProjects !== undefined) {
          setProjects(cachedProjects);
          setIsLoading(false);
          return;
        }

        setRequiresAuthentication(true);
        setIsLoading(false);
      } catch (error) {
        setProjects(undefined);
        setError(error instanceof Error ? error : new Error(String(error)));
        setIsLoading(false);
      }
    })();
  }, [refreshProjects, skipCache]);

  if (error) {
    return {
      projects: undefined,
      isLoading: false,
      error,
      requiresAuthentication: false,
      refreshProjects,
    };
  }

  if (requiresAuthentication) {
    return {
      projects: undefined,
      isLoading: false,
      error: undefined,
      requiresAuthentication: true,
      refreshProjects,
    };
  }

  return isLoading
    ? {
        projects: undefined,
        isLoading: true,
        error: undefined,
        requiresAuthentication: false,
        refreshProjects,
      }
    : {
        projects: projects ?? [],
        isLoading: false,
        error: undefined,
        requiresAuthentication: false,
        refreshProjects,
      };
};

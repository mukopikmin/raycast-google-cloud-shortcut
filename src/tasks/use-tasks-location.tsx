import { useEffect, useState } from "react";
import { listLocations, TasksLocation } from "./task";

type UseTasksLocationsResult =
  | {
      locations: TasksLocation[];
      isLoading: false;
      error: undefined;
    }
  | {
      locations: undefined;
      isLoading: true;
      error: undefined;
    };

export const useTasksLocations = (projectId: string): UseTasksLocationsResult => {
  const [locations, setLocations] = useState<TasksLocation[] | undefined>(undefined);

  useEffect(() => {
    const load = async () => {
      const fetchedLocations = await listLocations(projectId);
      setLocations(fetchedLocations);
    };

    load();
  }, [projectId]);

  return locations === undefined
    ? {
        locations: undefined,
        isLoading: true,
        error: undefined,
      }
    : { locations, isLoading: false, error: undefined };
};

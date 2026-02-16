import { useEffect, useState } from "react";
import { listTasksQueues, TasksQueue } from "./task";

type UseTasksResult =
  | {
      queues: TasksQueue[];
      isLoading: false;
      error: undefined;
    }
  | { queues: undefined; isLoading: true; error: undefined };

export const useTasks = (projectId: string, locationId: string): UseTasksResult => {
  const [queues, setTasks] = useState<TasksQueue[] | undefined>(undefined);

  useEffect(() => {
    const load = async () => {
      const fetchedTasks = await listTasksQueues(projectId, locationId);
      setTasks(fetchedTasks);
    };

    load();
  }, [projectId, locationId]);

  return queues === undefined
    ? {
        queues: undefined,
        isLoading: true,
        error: undefined,
      }
    : {
        queues,
        isLoading: false,
        error: undefined,
      };
};

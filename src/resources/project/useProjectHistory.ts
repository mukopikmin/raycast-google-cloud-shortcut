import { showToast, Toast } from "@raycast/api";
import { usePromise } from "@raycast/utils";
import { listRecentProjects, recordRecentProject } from "./history";

export const useProjectHistory = () => {
  const { data, isLoading, error, revalidate } = usePromise(listRecentProjects);

  const recordSelection = async (projectId: string) => {
    try {
      await recordRecentProject(projectId);
      await revalidate();
    } catch {
      await showToast({ style: Toast.Style.Failure, title: "Could Not Save Project History" });
    }
  };

  return { recentProjects: data ?? [], isLoading, error, recordSelection };
};

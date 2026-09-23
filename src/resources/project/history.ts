import { LocalStorage } from "@raycast/api";
import { Project } from "./types";

const HISTORY_KEY = "recent-projects";
const HISTORY_LIMIT = 500;
let pendingWrite = Promise.resolve();

export const listRecentProjects = async (): Promise<string[]> => {
  const stored = await LocalStorage.getItem<string>(HISTORY_KEY);
  if (stored === undefined) return [];

  try {
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return [...new Set(parsed.filter((id): id is string => typeof id === "string"))].slice(0, HISTORY_LIMIT);
  } catch {
    return [];
  }
};

export const recordRecentProject = (projectId: string): Promise<void> => {
  const write = pendingWrite.then(async () => {
    const recentProjects = await listRecentProjects();
    const updated = [projectId, ...recentProjects.filter((id) => id !== projectId)].slice(0, HISTORY_LIMIT);
    await LocalStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  });
  // Keep subsequent selections writable even if a previous storage operation failed.
  pendingWrite = write.catch(() => undefined);
  return write;
};

export const sortProjectsByRecency = (projects: Project[], recentProjects: string[]): Project[] => {
  const ranks = new Map(recentProjects.map((id, index) => [id, index]));
  return [...projects].sort(
    (a, b) => (ranks.get(a.id) ?? recentProjects.length) - (ranks.get(b.id) ?? recentProjects.length),
  );
};

import { beforeEach, describe, expect, it, vi } from "vitest";
import { useProjects } from "./useProjects";
import { getAccessToken } from "@raycast/utils";
import { launchAuthenticatedCommand } from "../../auth/launch";
import { cacheProjects, listCachedProjects } from "./cache";
import { listProjects } from "./api";

const mocks = vi.hoisted(() => ({
  effects: [] as (() => void)[],
  stateIndex: 0,
  setProjects: vi.fn(),
  setLoading: vi.fn(),
  setError: vi.fn(),
}));
vi.mock("react", () => ({
  useState: (initial: unknown) => [initial, [mocks.setProjects, mocks.setLoading, mocks.setError][mocks.stateIndex++]],
  useCallback: (callback: unknown) => callback,
  useEffect: (effect: () => void) => mocks.effects.push(effect),
}));
vi.mock("@raycast/utils", () => ({ getAccessToken: vi.fn(() => ({ token: "access", type: "oauth" })) }));
vi.mock("../../auth/launch", () => ({ launchAuthenticatedCommand: vi.fn(async () => undefined) }));
vi.mock("./cache", () => ({ cacheProjects: vi.fn(async () => undefined), listCachedProjects: vi.fn() }));
vi.mock("./api", () => ({ listProjects: vi.fn() }));

const flushEffects = async () => {
  mocks.effects.splice(0).forEach((effect) => effect());
  await new Promise<void>((resolve) => setImmediate(resolve));
};
const projects = [{ id: "project-1", name: "Project One" }];

describe("cached project browsing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.effects.length = 0;
    mocks.stateIndex = 0;
    vi.mocked(listCachedProjects).mockResolvedValue(projects);
    vi.mocked(listProjects).mockResolvedValue(projects);
  });

  it.each([{ cached: projects }, { cached: [] }])(
    "displays an existing cache without authentication or API calls",
    async ({ cached }) => {
      vi.mocked(listCachedProjects).mockResolvedValue(cached);
      useProjects();
      await flushEffects();
      expect(mocks.setProjects).toHaveBeenCalledWith(cached);
      expect(mocks.setLoading).toHaveBeenLastCalledWith(false);
      expect(getAccessToken).not.toHaveBeenCalled();
      expect(listProjects).not.toHaveBeenCalled();
      expect(launchAuthenticatedCommand).not.toHaveBeenCalled();
    },
  );

  it("requests an authenticated launch when there is no project cache", async () => {
    vi.mocked(listCachedProjects).mockResolvedValue(undefined);
    useProjects();
    await flushEffects();
    expect(launchAuthenticatedCommand).toHaveBeenCalledExactlyOnceWith({ type: "refresh-projects" });
    expect(getAccessToken).not.toHaveBeenCalled();
    expect(listProjects).not.toHaveBeenCalled();
  });

  it("explicit refresh also requests authentication at the command entry", async () => {
    const { refreshProjects } = useProjects();
    await refreshProjects();
    expect(launchAuthenticatedCommand).toHaveBeenCalledExactlyOnceWith({ type: "refresh-projects" });
    expect(getAccessToken).not.toHaveBeenCalled();
  });

  it("fetches and replaces the cache after an authenticated refresh launch", async () => {
    useProjects(true);
    await flushEffects();
    expect(listProjects).toHaveBeenCalledExactlyOnceWith("access");
    expect(cacheProjects).toHaveBeenCalledWith(projects);
    expect(mocks.setProjects).toHaveBeenCalledWith(projects);
    expect(listCachedProjects).not.toHaveBeenCalled();
    expect(launchAuthenticatedCommand).not.toHaveBeenCalled();
  });

  it("exposes refresh errors without overwriting cached projects", async () => {
    const error = new Error("API unavailable");
    vi.mocked(listProjects).mockRejectedValueOnce(error);
    useProjects(true);
    await flushEffects();
    expect(mocks.setError).toHaveBeenLastCalledWith(error);
    expect(mocks.setLoading).toHaveBeenLastCalledWith(false);
    expect(cacheProjects).not.toHaveBeenCalled();
  });
});

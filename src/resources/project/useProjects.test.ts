import { beforeEach, describe, expect, it, vi } from "vitest";
import { useProjects } from "./useProjects";
import { authorizeGoogleAccessToken, signInToGoogle } from "../../auth/google";
import { GoogleAuthenticationError } from "../../auth/GoogleAuthenticationError";
import { cacheProjects, listCachedProjects } from "./cache";
import { listProjects } from "./api";

const mocks = vi.hoisted(() => ({
  effects: [] as (() => void)[],
  stateIndex: 0,
  setProjects: vi.fn(),
  setLoading: vi.fn(),
  setError: vi.fn(),
  launch: vi.fn(async () => {
    throw new Error("command cannot launch itself");
  }),
}));
vi.mock("react", () => ({
  useState: (initial: unknown) => [initial, [mocks.setProjects, mocks.setLoading, mocks.setError][mocks.stateIndex++]],
  useCallback: (callback: unknown) => callback,
  useEffect: (effect: () => void) => mocks.effects.push(effect),
}));
vi.mock("@raycast/api", () => ({ launchCommand: mocks.launch }));
vi.mock("../../auth/google", () => ({
  authorizeGoogleAccessToken: vi.fn(async () => "access"),
  signInToGoogle: vi.fn(async () => "new-access"),
}));
vi.mock("./cache", () => ({ cacheProjects: vi.fn(async () => undefined), listCachedProjects: vi.fn() }));
vi.mock("./api", () => ({ listProjects: vi.fn() }));

const flushEffects = async () => {
  mocks.effects.splice(0).forEach((effect) => effect());
  await new Promise<void>((resolve) => setImmediate(resolve));
};
const projects = [{ id: "project-1", name: "Project One" }];

describe("project browsing and authentication", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.effects.length = 0;
    mocks.stateIndex = 0;
    vi.mocked(listCachedProjects).mockResolvedValue(projects);
    vi.mocked(listProjects).mockResolvedValue(projects);
  });

  it.each([{ cached: projects }, { cached: [] }])(
    "displays an existing cache without authentication",
    async ({ cached }) => {
      vi.mocked(listCachedProjects).mockResolvedValue(cached);
      useProjects();
      await flushEffects();
      expect(mocks.setProjects).toHaveBeenCalledWith(cached);
      expect(mocks.setLoading).toHaveBeenLastCalledWith(false);
      expect(authorizeGoogleAccessToken).not.toHaveBeenCalled();
      expect(listProjects).not.toHaveBeenCalled();
      expect(mocks.launch).not.toHaveBeenCalled();
    },
  );

  it("authenticates and fetches projects on uncached startup without launching another command", async () => {
    vi.mocked(listCachedProjects).mockResolvedValue(undefined);
    useProjects();
    await flushEffects();
    expect(authorizeGoogleAccessToken).toHaveBeenCalledOnce();
    expect(listProjects).toHaveBeenCalledExactlyOnceWith("access");
    expect(cacheProjects).toHaveBeenCalledWith(projects);
    expect(mocks.setProjects).toHaveBeenCalledWith(projects);
    expect(mocks.launch).not.toHaveBeenCalled();
  });

  it("refreshes projects in the current command", async () => {
    const { refreshProjects } = useProjects();
    await refreshProjects();
    expect(listProjects).toHaveBeenCalledExactlyOnceWith("access");
    expect(cacheProjects).toHaveBeenCalledWith(projects);
    expect(mocks.setProjects).toHaveBeenCalledWith(projects);
    expect(signInToGoogle).not.toHaveBeenCalled();
    expect(mocks.launch).not.toHaveBeenCalled();
  });

  it("exposes API errors without overwriting cached projects", async () => {
    const error = new Error("API unavailable");
    vi.mocked(listProjects).mockRejectedValueOnce(error);
    await useProjects().refreshProjects();
    expect(mocks.setError).toHaveBeenLastCalledWith(error);
    expect(mocks.setLoading).toHaveBeenLastCalledWith(false);
    expect(cacheProjects).not.toHaveBeenCalled();
  });

  it("starts fresh sign-in and retries project loading after an authentication failure", async () => {
    const error = new GoogleAuthenticationError("Refresh failed");
    vi.mocked(authorizeGoogleAccessToken).mockRejectedValueOnce(error);
    const actions = useProjects();
    await actions.refreshProjects();
    expect(mocks.setError).toHaveBeenLastCalledWith(error);
    expect(listProjects).not.toHaveBeenCalled();
    await actions.signInAndRefreshProjects();
    expect(signInToGoogle).toHaveBeenCalledOnce();
    expect(listProjects).toHaveBeenCalledExactlyOnceWith("new-access");
    expect(mocks.setProjects).toHaveBeenCalledWith(projects);
    expect(mocks.launch).not.toHaveBeenCalled();
  });

  it("keeps a cancelled sign-in recoverable without replacing cached data", async () => {
    const error = new GoogleAuthenticationError("Authorization cancelled");
    vi.mocked(signInToGoogle).mockRejectedValueOnce(error);
    const actions = useProjects();
    await actions.signInAndRefreshProjects();
    expect(mocks.setError).toHaveBeenLastCalledWith(error);
    expect(cacheProjects).not.toHaveBeenCalled();
    await actions.signInAndRefreshProjects();
    expect(listProjects).toHaveBeenCalledExactlyOnceWith("new-access");
    expect(mocks.launch).not.toHaveBeenCalled();
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";
import { LocalStorage } from "@raycast/api";
import { listRecentProjects, recordRecentProject, sortProjectsByRecency } from "./history";

vi.mock("@raycast/api", () => ({
  LocalStorage: { getItem: vi.fn(), setItem: vi.fn() },
}));

describe("project history", () => {
  let stored: string | undefined;

  beforeEach(() => {
    stored = undefined;
    vi.resetAllMocks();
    vi.mocked(LocalStorage.getItem).mockImplementation(async () => stored);
    vi.mocked(LocalStorage.setItem).mockImplementation(async (_key, value) => {
      stored = String(value);
    });
  });

  it("persists selections and moves a reopened project to the front without duplicates", async () => {
    await recordRecentProject("first");
    await recordRecentProject("second");
    await recordRecentProject("first");
    expect(await listRecentProjects()).toEqual(["first", "second"]);
  });

  it("preserves rapid selections and recovers after a failed write", async () => {
    vi.mocked(LocalStorage.setItem).mockRejectedValueOnce(new Error("Storage unavailable"));
    await expect(recordRecentProject("failed")).rejects.toThrow("Storage unavailable");
    await Promise.all([recordRecentProject("first"), recordRecentProject("second")]);
    expect(await listRecentProjects()).toEqual(["second", "first"]);
  });

  it("ranks only available projects and preserves the original order of unopened projects", () => {
    const projects = ["a", "b", "c", "d"].map((id) => ({ id, name: id }));
    expect(sortProjectsByRecency(projects, ["deleted", "c", "a"]).map(({ id }) => id)).toEqual(["c", "a", "b", "d"]);
    expect(projects.map(({ id }) => id)).toEqual(["a", "b", "c", "d"]);
    expect(sortProjectsByRecency(projects, [])).toEqual(projects);
  });

  it.each([undefined, "invalid json", "{}", "null"])("handles missing or malformed history: %s", async (value) => {
    stored = value;
    expect(await listRecentProjects()).toEqual([]);
  });

  it("filters invalid entries and duplicates", async () => {
    stored = JSON.stringify(["a", 1, null, "a", "b"]);
    expect(await listRecentProjects()).toEqual(["a", "b"]);
  });

  it("bounds history by discarding the least recently opened project", async () => {
    stored = JSON.stringify(Array.from({ length: 500 }, (_, i) => String(i)));
    await recordRecentProject("new");
    const history = await listRecentProjects();
    expect(history).toHaveLength(500);
    expect(history[0]).toBe("new");
    expect(history).not.toContain("499");
  });
});

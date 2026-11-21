import { describe, expect, it } from "vitest";
import { appendResourcePage, emptyResourcePageState, RESOURCE_LIMIT } from "./pages";

const getId = (resource: { id: string }) => resource.id;
const resources = (start: number, count: number) =>
  Array.from({ length: count }, (_, i) => ({ id: String(start + i) }));

describe("bounded resource pagination", () => {
  it("makes every resource reachable beyond 500 without exceeding the retained limit", () => {
    let state = emptyResourcePageState<{ id: string }>();
    const seen = new Set<string>();
    for (let offset = 0; offset < 1250; offset += 50) {
      state = appendResourcePage(
        state,
        {
          resources: resources(offset, 50),
          nextPageToken: offset < 1200 ? String(offset + 50) : undefined,
        },
        getId,
      );
      state.resources.forEach(({ id }) => seen.add(id));
      expect(state.resources.length).toBeLessThanOrEqual(RESOURCE_LIMIT);
      expect(state.nextPageToken).toBe(offset < 1200 ? String(offset + 50) : undefined);
    }
    expect(seen.size).toBe(1250);
    expect(state.resources[0].id).toBe("750");
    expect(state.resources.at(-1)?.id).toBe("1249");
    expect(state.isTruncated).toBe(true);
  });

  it("deduplicates overlapping pages without replacing different IDs with the same name", () => {
    const first = appendResourcePage(
      emptyResourcePageState<{ id: string; name: string }>(),
      {
        resources: [
          { id: "a", name: "same" },
          { id: "b", name: "same" },
        ],
        nextPageToken: "next",
      },
      getId,
    );
    const next = appendResourcePage(first, { resources: [{ id: "a", name: "updated" }] }, getId);
    expect(next.resources).toEqual([
      { id: "a", name: "updated" },
      { id: "b", name: "same" },
    ]);
  });

  it("keeps empty pages pageable and preserves omission notices until a restart", () => {
    const state = appendResourcePage(
      emptyResourcePageState<{ id: string }>(),
      {
        resources: resources(0, 550),
        nextPageToken: "next",
      },
      getId,
    );
    const empty = appendResourcePage(state, { resources: [], nextPageToken: "after-empty" }, getId);
    expect(empty.resources).toEqual(state.resources);
    expect(empty.nextPageToken).toBe("after-empty");
    expect(empty.isTruncated).toBe(true);
    expect(emptyResourcePageState().isTruncated).toBe(false);
  });
});

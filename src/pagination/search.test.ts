import { describe, expect, it, vi } from "vitest";
import { collectMatchingResourcePage, matchesResourceSearch } from "./search";
import { PageOptions, ResourcePage } from "./types";

type Resource = { id: string; name: string };
const getId = (item: Resource) => item.id;
const getSearchText = (item: Resource) => item.name;
const current = () => true;
const checked = () => undefined;
const dataset = (count: number, name: (id: number) => string) =>
  vi.fn(async ({ pageSize, pageToken }: PageOptions): Promise<ResourcePage<Resource>> => {
    const start = Number(pageToken ?? 0);
    return {
      resources: Array.from({ length: Math.min(pageSize, count - start) }, (_, index) => ({
        id: String(start + index),
        name: name(start + index),
      })),
      nextPageToken: start + pageSize < count ? String(start + pageSize) : undefined,
    };
  });

describe("resource search across API pages", () => {
  it("finds a resource after the first 500 without retaining nonmatching pages", async () => {
    const fetchPage = dataset(1250, (id) => (id === 1199 ? "target-resource" : `other-${id}`));
    const result = await collectMatchingResourcePage(
      fetchPage,
      { pageSize: 50 },
      "target-resource",
      getId,
      getSearchText,
      current,
      checked,
    );
    expect(result.resources).toEqual([{ id: "1199", name: "target-resource" }]);
    expect(result.nextPageToken).toBeUndefined();
    expect(fetchPage).toHaveBeenCalledTimes(25);
  });

  it("keeps an unfiltered initial load to a single API page", async () => {
    const fetchPage = dataset(1250, (id) => `resource-${id}`);
    const result = await collectMatchingResourcePage(
      fetchPage,
      { pageSize: 50 },
      "",
      getId,
      getSearchText,
      current,
      checked,
    );
    expect(result.resources).toHaveLength(50);
    expect(result.nextPageToken).toBe("50");
    expect(fetchPage).toHaveBeenCalledOnce();
  });

  it("stops at a page of sparse matches and resumes without losing results", async () => {
    const fetchPage = dataset(1250, (id) => `${id % 10 === 0 ? "match" : "other"}-${id}`);
    const first = await collectMatchingResourcePage(
      fetchPage,
      { pageSize: 50 },
      "match",
      getId,
      getSearchText,
      current,
      checked,
    );
    expect(first.resources).toHaveLength(50);
    expect(first.nextPageToken).toBe("500");
    expect(fetchPage).toHaveBeenCalledTimes(10);
    const second = await collectMatchingResourcePage(
      fetchPage,
      { pageSize: 50, pageToken: first.nextPageToken },
      "match",
      getId,
      getSearchText,
      current,
      checked,
    );
    expect(second.resources[0].id).toBe("500");
    expect(second.resources).toHaveLength(50);
    expect(second.nextPageToken).toBe("1000");
  });

  it("reports no matches only after all accessible pages have been checked", async () => {
    const fetchPage = dataset(620, (id) => `other-${id}`);
    const onPageChecked = vi.fn();
    const result = await collectMatchingResourcePage(
      fetchPage,
      { pageSize: 50 },
      "missing",
      getId,
      getSearchText,
      current,
      onPageChecked,
    );
    expect(result.resources).toEqual([]);
    expect(result.nextPageToken).toBeUndefined();
    expect(onPageChecked).toHaveBeenCalledTimes(13);
  });

  it("stops a superseded search before requesting another page", async () => {
    let isCurrent = true;
    const fetchPage = vi.fn(async () => {
      isCurrent = false;
      return { resources: [], nextPageToken: "next" };
    });
    await expect(
      collectMatchingResourcePage(
        fetchPage,
        { pageSize: 50 },
        "target",
        getId,
        getSearchText,
        () => isCurrent,
        checked,
      ),
    ).rejects.toMatchObject({ name: "AbortError" });
    expect(fetchPage).toHaveBeenCalledOnce();
  });

  it("preserves unavailable regions from nonmatching pages", async () => {
    const fetchPage = vi
      .fn()
      .mockResolvedValueOnce({ resources: [], nextPageToken: "next", unreachable: ["europe-west1"] })
      .mockResolvedValueOnce({ resources: [{ id: "target", name: "target" }], unreachable: ["asia-east1"] });
    const result = await collectMatchingResourcePage<Resource>(
      fetchPage,
      { pageSize: 50 },
      "target",
      getId,
      getSearchText,
      current,
      checked,
    );
    expect(result.resources).toHaveLength(1);
    expect(result.unreachable).toEqual(["asia-east1", "europe-west1"]);
  });

  it("propagates errors and repeated tokens instead of claiming the resource does not exist", async () => {
    const failure = new Error("API unavailable");
    const fetchPage = vi
      .fn()
      .mockResolvedValueOnce({ resources: [], nextPageToken: "next" })
      .mockRejectedValueOnce(failure);
    await expect(
      collectMatchingResourcePage(fetchPage, { pageSize: 50 }, "target", getId, getSearchText, current, checked),
    ).rejects.toBe(failure);
    const repeated = vi.fn(async () => ({ resources: [], nextPageToken: "next" }));
    await expect(
      collectMatchingResourcePage(repeated, { pageSize: 50 }, "target", getId, getSearchText, current, checked),
    ).rejects.toThrow("repeated pagination token");
  });

  it("matches all search terms across names and metadata without case sensitivity", () => {
    expect(matchesResourceSearch("production-api US-CENTRAL1", "  API  us-central1 ")).toBe(true);
    expect(matchesResourceSearch("production-api US-CENTRAL1", "api europe-west1")).toBe(false);
  });
});

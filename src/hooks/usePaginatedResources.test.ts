import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchGoogleApi } from "../auth/api";
import { useSecretManager } from "../resources/secret-manager/useSecretManager";
import { CLOUD_RUN_SEARCH_CONCURRENCY, useCloudRunServices } from "../resources/cloud-run/useCloudRunServices";
import { useCloudRunJobs } from "../resources/cloud-run/useCloudRunJobs";
import { useCloudRunWorkerPools } from "../resources/cloud-run/useCloudRunWorkerPools";
import { usePubSubResources } from "../resources/pubsub/usePubSubResources";
import { useCloudSchedulerJobs } from "../resources/cloud-scheduler/useCloudSchedulerJobs";
import { GoogleApiError } from "../auth/GoogleApiError";
import { GoogleAuthenticationRequiredError } from "../auth/GoogleAuthenticationRequiredError";

const credentials = vi.hoisted(() => ({ accessToken: "token" }));

// A small stateful hook runner lets these tests exercise real feature hooks and
// API helpers without requiring the Raycast host or a browser renderer.
const runtime = vi.hoisted(() => {
  const slots: unknown[] = [];
  let cursor = 0;
  const pending: Promise<unknown>[] = [];
  const equal = (a: unknown[], b: unknown[]) => a.length === b.length && a.every((value, i) => value === b[i]);
  return {
    reset: () => {
      slots.length = 0;
      cursor = 0;
      pending.length = 0;
    },
    render: <T>(hook: () => T) => {
      cursor = 0;
      return hook();
    },
    settle: async () => {
      await Promise.all(pending.splice(0));
    },
    useState: <T>(initial?: T | (() => T)) => {
      const index = cursor++;
      if (!(index in slots)) slots[index] = typeof initial === "function" ? (initial as () => T)() : initial;
      return [
        slots[index],
        (update: T | ((current: T) => T)) => {
          slots[index] = typeof update === "function" ? (update as (current: T) => T)(slots[index] as T) : update;
        },
      ];
    },
    useRef: <T>(value: T) => {
      const index = cursor++;
      if (!(index in slots)) slots[index] = { current: value };
      return slots[index];
    },
    useMemo: <T>(factory: () => T, dependencies: unknown[]) => {
      const index = cursor++;
      const previous = slots[index] as { dependencies: unknown[]; value: T } | undefined;
      if (!previous || !equal(previous.dependencies, dependencies)) {
        slots[index] = { dependencies, value: factory() };
      }
      return (slots[index] as { value: T }).value;
    },
    usePromise: (
      fn: (...args: unknown[]) => Promise<unknown>,
      args: unknown[],
      options?: { onData?: (data: unknown) => void },
    ) => {
      const index = cursor++;
      type State = {
        args: unknown[];
        isLoading: boolean;
        error?: Error;
        data?: unknown;
        version: number;
        fn: typeof fn;
        options: typeof options;
      };
      let state = slots[index] as State | undefined;
      const changed = !state || !equal(state.args, args);
      if (!state) {
        state = { args, isLoading: true, version: 0, fn, options };
        slots[index] = state;
      }
      const current = state;
      Object.assign(current, { args, fn, options });
      const revalidate = async () => {
        const version = ++current.version;
        current.isLoading = true;
        current.error = undefined;
        try {
          const data = await current.fn(...current.args);
          if (version === current.version) {
            current.options?.onData?.(data);
            current.data = data;
            current.isLoading = false;
          }
          return data;
        } catch (error) {
          if (version === current.version) {
            current.error = error as Error;
            current.isLoading = false;
          }
          return error;
        }
      };
      if (changed) pending.push(revalidate());
      return { isLoading: current.isLoading, error: current.error, data: current.data, revalidate };
    },
  };
});

vi.mock("react", () => ({
  useState: runtime.useState,
  useRef: runtime.useRef,
  useMemo: runtime.useMemo,
  useEffect: () => undefined,
  useCallback: (callback: unknown, dependencies: unknown[]) => runtime.useMemo(() => callback, dependencies),
}));
vi.mock("@raycast/utils", () => ({ usePromise: runtime.usePromise }));
vi.mock("../auth/google", () => ({ useGoogleApi: () => ({ accessToken: credentials.accessToken }) }));
vi.mock("../auth/api", () => ({ fetchGoogleApi: vi.fn() }));

const fetchMock = vi.mocked(fetchGoogleApi);
const pageResponse = (url: string) => {
  const parsed = new URL(url);
  if (parsed.pathname.endsWith("/locations")) {
    return { locations: [{ locationId: "us-central1" }] };
  }
  const offset = Number(parsed.searchParams.get("pageToken") || parsed.searchParams.get("continue") || 0);
  const globalSearch = parsed.pathname.includes("/locations/-/services");
  const size = Number(parsed.searchParams.get("pageSize") || parsed.searchParams.get("limit") || 620);
  const nextPageToken = offset + size < 620 ? String(offset + size) : undefined;
  const ids = Array.from({ length: Math.min(size, 620 - offset) }, (_, i) => String(offset + i));
  if (parsed.pathname.startsWith("/v2/")) {
    return {
      services: ids.map((id) => ({
        uid: id,
        name: `projects/project/locations/us-central1/services/deployment-${id}`,
      })),
      nextPageToken,
    };
  }
  if (parsed.hostname === "secretmanager.googleapis.com") {
    return { secrets: ids.map((id) => ({ name: `projects/project/secrets/secret-${id}` })), nextPageToken };
  }
  if (parsed.hostname === "pubsub.googleapis.com") {
    const kind = parsed.pathname.endsWith("topics") ? "topics" : "subscriptions";
    return {
      [kind]: ids.map((id) => ({ name: `projects/project/${kind}/${id}`, topic: "projects/project/topics/topic" })),
      nextPageToken,
    };
  }
  if (parsed.hostname === "cloudscheduler.googleapis.com") {
    const prefix = parsed.searchParams.has("legacyAppEngineCron") ? "legacy" : "default";
    return {
      jobs: ids.map((id) => ({
        name: `projects/project/locations/us-central1/jobs/${prefix}-${id}`,
        schedule: "0 * * * *",
        timeZone: "UTC",
        description: "",
      })),
      nextPageToken,
    };
  }
  return {
    items: ids.map((id) => ({
      metadata: { uid: id, name: `deployment-${id}`, labels: { "cloud.googleapis.com/location": "us-central1" } },
    })),
    metadata: { continue: parsed.pathname.includes("serving.knative.dev") ? undefined : nextPageToken },
    unreachable: globalSearch ? [] : ["europe-west1"],
  };
};

const hooks: { name: string; count: number; hook: (query?: string) => Result }[] = [
  {
    name: "Secret Manager",
    count: 620,
    hook: (query = "") => {
      const result = useSecretManager("project", query);
      return { ...result, items: result.secrets };
    },
  },
  {
    name: "Cloud Run services",
    count: 620,
    hook: (query = "") => {
      const result = useCloudRunServices("project", query);
      return { ...result, items: result.services };
    },
  },
  {
    name: "Cloud Run jobs",
    count: 620,
    hook: (query = "") => {
      const result = useCloudRunJobs("project", query);
      return { ...result, items: result.jobs };
    },
  },
  {
    name: "Cloud Run worker pools",
    count: 620,
    hook: (query = "") => {
      const result = useCloudRunWorkerPools("project", query);
      return { ...result, items: result.workerPools };
    },
  },
  {
    name: "Pub/Sub streams",
    count: 1240,
    hook: (query = "") => {
      const result = usePubSubResources("project", query);
      return { ...result, items: result.resources };
    },
  },
  {
    name: "Cloud Scheduler streams",
    count: 1240,
    hook: (query = "") => {
      const result = useCloudSchedulerJobs("project", "us-central1", query);
      return { ...result, items: result.scheduledJobs };
    },
  },
];

type Item = { id?: string; name: string; resourceType?: string };
type Result = {
  items: Item[] | undefined;
  hasMore: boolean;
  isTruncated: boolean;
  isLoadingMore: boolean;
  isSearching?: boolean;
  pagesSearched?: number;
  resourcesSearched?: number;
  loadMore: () => Promise<void>;
  reload?: () => Promise<void>;
  error: Error | undefined;
};
const key = (item: Item) => item.id ?? `${item.resourceType ?? ""}/${item.name}`;

describe("resource pagination beyond 500", () => {
  beforeEach(() => {
    credentials.accessToken = "token";
    runtime.reset();
    fetchMock.mockReset();
    fetchMock.mockImplementation(async (url) => pageResponse(url));
  });

  it("follows an empty global page and retries only its reported unreachable region", async () => {
    const entry = {
      metadata: { uid: "journal-id", name: "journal", labels: { "cloud.googleapis.com/location": "asia-northeast1" } },
    };
    fetchMock
      .mockResolvedValueOnce({ items: [], metadata: { continue: "a+b/=" }, unreachable: ["asia-northeast1"] })
      .mockResolvedValueOnce({ items: [entry] })
      .mockResolvedValueOnce({
        services: [{ uid: "journal-id", name: "projects/project/locations/asia-northeast1/services/journal" }],
      });
    const hook = () => useCloudRunServices("project", "journal");
    runtime.render(hook);
    await runtime.settle();
    const result = runtime.render(hook);
    expect(result.services.map(({ name }) => name)).toEqual(["journal"]);
    expect(result.unreachable).toEqual([]);
    expect(result.pagesSearched).toBe(3);
    expect(result.resourcesSearched).toBe(2);
    expect(result.hasMore).toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(new URL(fetchMock.mock.calls[1][0]).searchParams.get("continue")).toBe("a+b/=");
    expect(fetchMock.mock.calls[2][0]).toContain("/v2/projects/project/locations/asia-northeast1/services?");
    expect(fetchMock.mock.calls.some(([url]) => new URL(url).pathname.endsWith("/locations"))).toBe(false);
  });

  it("shows global matches while retrying an unavailable region", async () => {
    let resolveRegion!: (data: unknown) => void;
    fetchMock
      .mockResolvedValueOnce({
        items: [
          { metadata: { uid: "journal", name: "journal", labels: { "cloud.googleapis.com/location": "us-central1" } } },
        ],
        unreachable: ["asia-northeast1"],
      })
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveRegion = resolve;
          }),
      );
    const hook = () => useCloudRunServices("project", "journal");
    runtime.render(hook);
    try {
      await vi.waitFor(() => expect(runtime.render(hook).services[0]?.name).toBe("journal"));
      expect(runtime.render(hook).isSearching).toBe(true);
      expect(runtime.render(hook).unreachable).toEqual(["asia-northeast1"]);
    } finally {
      resolveRegion({ services: [] });
      await runtime.settle();
    }
    expect(runtime.render(hook).isSearching).toBe(false);
    expect(runtime.render(hook).unreachable).toEqual([]);
  });

  it("aborts an old global request when the query changes", async () => {
    let oldSignal!: AbortSignal;
    fetchMock.mockImplementationOnce((_url, _token, init) => {
      oldSignal = init!.signal as AbortSignal;
      return new Promise((_resolve, reject) => {
        oldSignal.addEventListener("abort", () => reject(Object.assign(new Error("Aborted"), { name: "AbortError" })), {
          once: true,
        });
      });
    });
    let query = "old-query";
    const hook = () => useCloudRunServices("project", query);
    runtime.render(hook);
    expect(oldSignal.aborted).toBe(false);
    query = "619";
    runtime.render(hook);
    expect(oldSignal.aborted).toBe(true);
    await runtime.settle();
    expect(runtime.render(hook).services[0].name).toBe("deployment-619");
    expect(runtime.render(hook).error).toBeUndefined();
  });

  it("limits parallel requests, keeps each region sequential, and finds a match past two large pages", async () => {
    const regions = Array.from({ length: 21 }, (_, index) => `region-${String(index).padStart(2, "0")}`);
    const activeRegions = new Set<string>();
    let peak = 0;
    fetchMock.mockImplementation(async (url) => {
      const parsed = new URL(url);
      if (parsed.pathname.includes("/locations/-/services")) return { unreachable: regions };
      const region = parsed.pathname.split("/")[5];
      expect(activeRegions.has(region)).toBe(false);
      activeRegions.add(region);
      peak = Math.max(peak, activeRegions.size);
      await new Promise((resolve) => setTimeout(resolve, 0));
      activeRegions.delete(region);
      const count = region === regions[0] ? 1100 : 1;
      const offset = Number(parsed.searchParams.get("pageToken") || 0);
      const size = Number(parsed.searchParams.get("pageSize"));
      return {
        services: Array.from({ length: Math.min(size, count - offset) }, (_, index) => ({
          name: `projects/project/locations/${region}/services/${region === regions[0] && offset + index === 1099 ? "journal" : `journal-backup-${offset + index}`}`,
        })),
        nextPageToken: offset + size < count ? String(offset + size) : undefined,
      };
    });
    const hook = () => useCloudRunServices("project", "journal");
    runtime.render(hook);
    await runtime.settle();
    const result = runtime.render(hook);
    expect(result.services[0].name).toBe("journal");
    expect(result.services).toHaveLength(500);
    expect(result.resourcesSearched).toBe(1120);
    expect(peak).toBeGreaterThan(1);
    expect(peak).toBeLessThanOrEqual(CLOUD_RUN_SEARCH_CONCURRENCY);
    expect(activeRegions.size).toBe(0);
    expect(result.error).toBeUndefined();
    const regionalRequests = fetchMock.mock.calls.filter(([url]) => url.includes("/v2/"));
    expect(regionalRequests).toHaveLength(23);
    expect(regionalRequests.every(([url]) => new URL(url).searchParams.get("pageSize") === "500")).toBe(true);
    expect(
      regionalRequests
        .filter(([url]) => url.includes(regions[0]))
        .map(([url]) => new URL(url).searchParams.get("pageToken")),
    ).toEqual([null, "500", "1000"]);
  });

  it("shows a fast match while another region is still loading", async () => {
    let resolveSlow!: (data: unknown) => void;
    fetchMock.mockImplementation(async (url) => {
      if (url.includes("/locations/-/services")) return { unreachable: ["a-slow", "z-fast"] };
      if (url.includes("/a-slow/"))
        return new Promise((resolve) => {
          resolveSlow = resolve;
        });
      return { services: [{ name: "projects/project/locations/z-fast/services/journal" }] };
    });
    const hook = () => useCloudRunServices("project", "journal");
    runtime.render(hook);
    try {
      await vi.waitFor(() => expect(runtime.render(hook).services[0]?.name).toBe("journal"));
      expect(runtime.render(hook).isSearching).toBe(true);
      expect(runtime.render(hook).pagesSearched).toBe(2);
    } finally {
      resolveSlow({ services: [] });
      await runtime.settle();
    }
    expect(runtime.render(hook).isSearching).toBe(false);
    expect(runtime.render(hook).services[0].name).toBe("journal");
  });

  it("aborts all old parallel requests when a new query starts", async () => {
    const oldSignals: AbortSignal[] = [];
    let oldQuery = true;
    fetchMock.mockImplementation(async (url, _token, init) => {
      if (url.includes("/locations/-/services"))
        return { unreachable: Array.from({ length: 8 }, (_, index) => `region-${index}`) };
      if (oldQuery) {
        const signal = init!.signal as AbortSignal;
        oldSignals.push(signal);
        return new Promise((_resolve, reject) =>
          signal.addEventListener("abort", () => reject(Object.assign(new Error("Aborted"), { name: "AbortError" })), {
            once: true,
          }),
        );
      }
      const region = new URL(url).pathname.split("/")[5];
      return { services: [{ name: `projects/project/locations/${region}/services/new-service` }] };
    });
    let query = "old-service";
    const hook = () => useCloudRunServices("project", query);
    runtime.render(hook);
    await vi.waitFor(() => expect(oldSignals).toHaveLength(CLOUD_RUN_SEARCH_CONCURRENCY));
    oldQuery = false;
    query = "new-service";
    runtime.render(hook);
    expect(oldSignals.every((signal) => signal.aborted)).toBe(true);
    await runtime.settle();
    const result = runtime.render(hook);
    expect(result.services).toHaveLength(8);
    expect(result.services.every(({ name }) => name === "new-service")).toBe(true);
    expect(result.error).toBeUndefined();
    expect(result.pagesSearched).toBe(9);
  });

  it.each([new GoogleApiError(401, "Unauthorized"), new GoogleAuthenticationRequiredError()])(
    "stops outstanding parallel work on an authentication failure: %s",
    async (failure) => {
      const signals: AbortSignal[] = [];
      fetchMock.mockImplementation(async (url, _token, init) => {
        if (url.includes("/locations/-/services"))
          return { unreachable: Array.from({ length: 8 }, (_, index) => `region-${index}`) };
        const signal = init!.signal as AbortSignal;
        signals.push(signal);
        if (url.includes("/region-0/")) throw failure;
        return new Promise((_resolve, reject) =>
          signal.addEventListener("abort", () => reject(Object.assign(new Error("Aborted"), { name: "AbortError" })), {
            once: true,
          }),
        );
      });
      const hook = () => useCloudRunServices("project", "journal");
      runtime.render(hook);
      await runtime.settle();
      expect(runtime.render(hook).error).toBe(failure);
      expect(signals).toHaveLength(CLOUD_RUN_SEARCH_CONCURRENCY);
      expect(signals.every((signal) => signal.aborted)).toBe(true);
      expect(fetchMock).toHaveBeenCalledTimes(1 + CLOUD_RUN_SEARCH_CONCURRENCY);
    },
  );

  it.each(["query", "project", "credentials", "reload"])(
    "fetches a fresh global list after %s changes without regional discovery",
    async (change) => {
      let projectId = "project";
      let query = "619";
      const hook = () => useCloudRunServices(projectId, query);
      runtime.render(hook);
      await runtime.settle();
      if (change === "query") query = "618";
      if (change === "project") projectId = "second-project";
      if (change === "credentials") credentials.accessToken = "new-token";
      if (change === "reload") await runtime.render(hook).reload();
      else {
        runtime.render(hook);
        await runtime.settle();
      }
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(fetchMock.mock.calls.every(([url]) => url.includes("/locations/-/services"))).toBe(true);
      expect(runtime.render(hook).pagesSearched).toBe(1);
      expect(runtime.render(hook).services).toHaveLength(1);
      expect(runtime.render(hook).error).toBeUndefined();
    },
  );

  it.each(["j", "journal"])(
    "finds journal globally for %s after the bounded snapshot returned only 53 services without a token",
    async (search) => {
      fetchMock.mockImplementation(async (url) => {
        const parsed = new URL(url);
        const service = (region: string, index: number) => ({
          uid: `${region}-${index}`,
          name: `projects/project/locations/${region}/services/${region === "asia-northeast1" && index === 619 ? "journal" : `project-service-${index}`}`,
        });
        if (parsed.pathname.includes("serving.knative.dev") || parsed.pathname.includes("/locations/-/services")) {
          const entries = [
            ...Array.from({ length: parsed.searchParams.has("limit") ? 50 : 620 }, (_, index) =>
              service("asia-northeast1", index),
            ),
            ...Array.from({ length: 3 }, (_, index) => service("europe-west1", index)),
          ];
          return {
            items: entries.map((entry) => ({
              metadata: {
                uid: entry.uid,
                name: entry.name.split("/").at(-1),
                labels: { "cloud.googleapis.com/location": entry.name.split("/")[3] },
              },
            })),
            metadata: {},
          };
        }
        if (parsed.pathname.endsWith("/locations")) {
          return parsed.searchParams.has("pageToken")
            ? { locations: [{ locationId: "asia-northeast1" }, { locationId: "us-central1" }] }
            : {
                locations: [{ locationId: "asia-northeast1" }, { locationId: "europe-west1" }],
                nextPageToken: "more-locations",
              };
        }
        const region = parsed.pathname.split("/")[5];
        const count = region === "asia-northeast1" ? 620 : region === "europe-west1" ? 3 : 0;
        const offset = Number(parsed.searchParams.get("pageToken") || 0);
        const size = Number(parsed.searchParams.get("pageSize"));
        return {
          services: Array.from({ length: Math.min(size, count - offset) }, (_, index) =>
            service(region, offset + index),
          ),
          nextPageToken: offset + size < count ? String(offset + size) : undefined,
        };
      });
      let query = "";
      const hook = () => useCloudRunServices("project", query);
      runtime.render(hook);
      await runtime.settle();
      const initial = runtime.render(hook);
      expect(initial.services).toHaveLength(53);
      expect(initial.services.some(({ name }) => name === "journal")).toBe(false);
      expect(initial.hasMore).toBe(true);
      expect(fetchMock).toHaveBeenCalledOnce();

      query = search;
      runtime.render(hook);
      await runtime.settle();
      const result = runtime.render(hook);
      expect(result.services[0]).toMatchObject({ name: "journal", region: "asia-northeast1" });
      expect(result.services).toHaveLength(search === "j" ? 500 : 1);
      expect(result.resourcesSearched).toBe(623);
      expect(result.pagesSearched).toBe(1);
      expect(result.hasMore).toBe(false);
      expect(result.error).toBeUndefined();
      expect(fetchMock.mock.calls.filter(([url]) => url.includes("serving.knative.dev"))).toHaveLength(1);
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(fetchMock.mock.calls[1][0]).toContain("/locations/-/services?");
      expect(new URL(fetchMock.mock.calls[1][0]).searchParams.has("limit")).toBe(false);
    },
  );

  it("continues location discovery after an empty locations page during unfiltered browsing", async () => {
    fetchMock
      .mockResolvedValueOnce({ items: [] })
      .mockResolvedValueOnce({ locations: [], nextPageToken: "more-locations" })
      .mockResolvedValueOnce({ locations: [{ locationId: "asia-northeast1" }] })
      .mockResolvedValueOnce({ services: [{ name: "projects/project/locations/asia-northeast1/services/journal" }] });
    const hook = () => useCloudRunServices("project");
    runtime.render(hook);
    await runtime.settle();
    for (let page = 0; page < 3; page++) await runtime.render(hook).loadMore();
    const result = runtime.render(hook);
    expect(result.services.map(({ name }) => name)).toEqual(["journal"]);
    expect(fetchMock).toHaveBeenCalledTimes(4);
    expect(fetchMock.mock.calls[2][0]).toContain("pageToken=more-locations");
  });

  it("preserves regional matches and reports a region that cannot be read", async () => {
    fetchMock
      .mockResolvedValueOnce({ unreachable: ["asia-northeast1", "europe-west1"] })
      .mockResolvedValueOnce({ services: [{ name: "projects/project/locations/asia-northeast1/services/journal" }] })
      .mockRejectedValueOnce(new GoogleApiError(403, "Region unavailable"));
    const hook = () => useCloudRunServices("project", "journal");
    runtime.render(hook);
    await runtime.settle();
    const result = runtime.render(hook);
    expect(result.services.map(({ name }) => name)).toEqual(["journal"]);
    expect(result.unreachable).toEqual(["europe-west1"]);
    expect(result.error).toBeUndefined();
  });

  it.each(["global", "authentication"])(
    "propagates %s failures instead of reporting no service matches",
    async (stage) => {
      const failure = new GoogleApiError(stage === "global" ? 403 : 401, "Request failed");
      if (stage === "authentication") fetchMock.mockResolvedValueOnce({ unreachable: ["asia-northeast1"] });
      fetchMock.mockRejectedValueOnce(failure);
      const hook = () => useCloudRunServices("project", "journal");
      runtime.render(hook);
      await runtime.settle();
      expect(runtime.render(hook).error).toBe(failure);
    },
  );

  it.each(["global", "regional", "locations"])(
    "rejects repeated %s API tokens even though local continuation tokens advance",
    async (stage) => {
      if (stage === "regional") fetchMock.mockResolvedValueOnce({ unreachable: ["asia-northeast1"] });
      if (stage === "locations") fetchMock.mockResolvedValueOnce({ items: [] });
      fetchMock.mockResolvedValue({
        metadata: { continue: "same-token" },
        services: [],
        locations: [],
        nextPageToken: "same-token",
      });
      const hook = () => useCloudRunServices("project", stage === "locations" ? "" : "journal");
      runtime.render(hook);
      await runtime.settle();
      if (stage === "locations") {
        await runtime.render(hook).loadMore();
        await runtime.render(hook).loadMore();
      }
      expect(runtime.render(hook).error?.message).toContain("repeated pagination token");
      expect(fetchMock).toHaveBeenCalledTimes(stage === "global" ? 2 : 3);
    },
  );

  it.each(["query", "project"])(
    "ignores stale global results and fallback regions when the %s changes",
    async (change) => {
      let resolveOldPage!: (data: unknown) => void;
      fetchMock.mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveOldPage = resolve;
          }),
      );
      let projectId = "first-project";
      let query = change === "project" ? "619" : "old-query";
      const hook = () => useCloudRunServices(projectId, query);
      runtime.render(hook);
      if (change === "project") projectId = "second-project";
      if (change === "query") query = "619";
      runtime.render(hook);
      resolveOldPage({ unreachable: ["stale-region"] });
      await runtime.settle();
      const result = runtime.render(hook);
      expect(result.services).toHaveLength(1);
      expect(result.services[0]).toMatchObject({ name: "deployment-619", projectId });
      expect(result.pagesSearched).toBe(1);
      expect(result.resourcesSearched).toBe(620);
      expect(result.error).toBeUndefined();
      expect(fetchMock.mock.calls.some(([url]) => url.includes("stale-region"))).toBe(false);
    },
  );

  it.each(hooks.filter(({ count }) => count === 620))(
    "shows journal for j even when $name has hundreds of earlier matching resources",
    async ({ hook: featureHook, name: featureName }) => {
      fetchMock.mockImplementation(async (url) => {
        const parsed = new URL(url);
        if (parsed.pathname.endsWith("/locations")) return { locations: [{ locationId: "us-central1" }] };
        const offset = Number(parsed.searchParams.get("pageToken") || parsed.searchParams.get("continue") || 0);
        const size = Number(parsed.searchParams.get("pageSize") || parsed.searchParams.get("limit") || 620);
        const ids = Array.from({ length: Math.min(size, 620 - offset) }, (_, index) => String(offset + index));
        const name = (id: string) => (id === "619" ? "journal" : `project-service-${id}`);
        const next = offset + size < 620 ? String(offset + size) : undefined;
        if (parsed.hostname === "secretmanager.googleapis.com") {
          return { secrets: ids.map((id) => ({ name: `projects/project/secrets/${name(id)}` })), nextPageToken: next };
        }
        if (parsed.pathname.startsWith("/v2/")) {
          return {
            services: ids.map((id) => ({
              uid: id,
              name: `projects/project/locations/us-central1/services/${name(id)}`,
            })),
            nextPageToken: next,
          };
        }
        return {
          items: ids.map((id) => ({
            metadata: { uid: id, name: name(id), labels: { "cloud.googleapis.com/location": "us-central1" } },
          })),
          metadata: { continue: next },
          unreachable: [],
        };
      });
      let query = "j";
      const hook = () => featureHook(query);
      runtime.render(hook);
      await runtime.settle();
      let result = runtime.render(hook);
      expect(result.items?.[0].name).toBe("journal");
      expect(result.items).toHaveLength(500);
      expect(result.isTruncated).toBe(true);
      expect(result.hasMore).toBe(false);
      expect(result.pagesSearched).toBe(featureName === "Cloud Run services" ? 1 : 13);
      expect(result.resourcesSearched).toBe(620);
      query = "journal";
      runtime.render(hook);
      await runtime.settle();
      result = runtime.render(hook);
      expect(result.items?.map(({ name }) => name)).toEqual(["journal"]);
      expect(result.isTruncated).toBe(false);
      expect(result.resourcesSearched).toBe(620);
    },
  );

  it.each(hooks.filter(({ count }) => count === 1240))(
    "ranks a late journal result across both $name without discarding its stream",
    async ({ hook: featureHook, name: featureName }) => {
      fetchMock.mockImplementation(async (url) => {
        const parsed = new URL(url);
        const offset = Number(parsed.searchParams.get("pageToken") || 0);
        const size = Number(parsed.searchParams.get("pageSize"));
        const ids = Array.from({ length: Math.min(size, 620 - offset) }, (_, index) => String(offset + index));
        const nextPageToken = offset + size < 620 ? String(offset + size) : undefined;
        if (featureName === "Pub/Sub streams") {
          const topics = parsed.pathname.endsWith("topics");
          const kind = topics ? "topics" : "subscriptions";
          return {
            [kind]: ids.map((id) => ({
              name: `projects/project/${kind}/${topics && id === "619" ? "journal" : `project-${kind}-${id}`}`,
              topic: "projects/project/topics/topic",
            })),
            nextPageToken,
          };
        }
        const legacy = parsed.searchParams.has("legacyAppEngineCron");
        return {
          jobs: ids.map((id) => ({
            name: `projects/project/locations/us-central1/jobs/${!legacy && id === "619" ? "journal" : `project-${legacy ? "legacy" : "default"}-${id}`}`,
            schedule: "0 * * * *",
            timeZone: "UTC",
            description: "",
          })),
          nextPageToken,
        };
      });
      const hook = () => featureHook("j");
      runtime.render(hook);
      await runtime.settle();
      const result = runtime.render(hook);
      expect(result.items?.[0].name).toBe("journal");
      expect(result.items).toHaveLength(500);
      expect(result.isTruncated).toBe(true);
      expect(result.pagesSearched).toBe(26);
      expect(result.error).toBeUndefined();
    },
  );

  it.each(hooks)(
    "finds an unrequested $name resource beyond item 500",
    async ({ hook: featureHook, count, name: featureName }) => {
      let query = "";
      const hook = () => featureHook(query);
      runtime.render(hook);
      await runtime.settle();
      expect(runtime.render(hook).items?.some(({ name }) => name.endsWith("619"))).toBe(false);
      query = "619";
      runtime.render(hook);
      expect(runtime.render(hook).isSearching).toBe(true);
      await runtime.settle();
      const result = runtime.render(hook);
      expect(result.items).toHaveLength(count === 620 ? 1 : 2);
      expect(result.items?.every(({ name }) => name.endsWith("619"))).toBe(true);
      expect(result.hasMore).toBe(false);
      expect(result.isSearching).toBe(false);
      expect(result.pagesSearched).toBe(featureName === "Cloud Run services" ? 1 : count === 620 ? 13 : 26);
      expect(result.error).toBeUndefined();
      const requests = fetchMock.mock.calls.length;
      query = "";
      runtime.render(hook);
      await runtime.settle();
      const unfiltered = runtime.render(hook);
      expect(unfiltered.items?.length).toBe(count === 620 ? 50 : 100);
      expect(unfiltered.isSearching).toBe(false);
      expect(fetchMock.mock.calls.length - requests).toBe(count === 620 ? 1 : 2);
    },
  );

  it.each(hooks.filter(({ count }) => count === 620))(
    "finds an evicted $name resource by restarting the search",
    async ({ hook: featureHook }) => {
      let query = "";
      const hook = () => featureHook(query);
      runtime.render(hook);
      await runtime.settle();
      let result = runtime.render(hook);
      const firstResource = result.items?.[0];
      for (let page = 0; result.hasMore && page < 20; page++) {
        await result.loadMore();
        result = runtime.render(hook);
      }
      expect(result.isTruncated).toBe(true);
      expect(result.items?.some((item) => key(item) === key(firstResource!))).toBe(false);
      query = firstResource!.name;
      runtime.render(hook);
      await runtime.settle();
      result = runtime.render(hook);
      expect(result.items).toHaveLength(1);
      expect(key(result.items![0])).toBe(key(firstResource!));
      expect(result.isTruncated).toBe(false);
      expect(result.error).toBeUndefined();
    },
  );

  it("cancels a search when the query changes and rejects stale load-more actions", async () => {
    let query = "";
    const hook = () => useSecretManager("project", query);
    runtime.render(hook);
    await runtime.settle();
    const staleLoadMore = runtime.render(hook).loadMore;
    let resolveOldPage!: (data: unknown) => void;
    fetchMock.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveOldPage = resolve;
        }),
    );
    query = "619";
    runtime.render(hook);
    query = "secret-0";
    runtime.render(hook);
    await staleLoadMore();
    resolveOldPage(pageResponse("https://secretmanager.googleapis.com/v1/projects/project/secrets?pageSize=50"));
    await runtime.settle();
    const result = runtime.render(hook);
    expect(result.secrets.map(({ name }) => name)).toEqual(["secret-0"]);
    expect(result.error).toBeUndefined();
    expect(result.isSearching).toBe(false);
    expect(result.pagesSearched).toBe(13);
    expect(result.resourcesSearched).toBe(620);
    expect(fetchMock).toHaveBeenCalledTimes(15);
  });

  it("counts nonmatching resources in an empty search and resets counts on a new search", async () => {
    let query = "missing-service";
    const hook = () => useCloudRunServices("project", query);
    runtime.render(hook);
    await runtime.settle();
    let result = runtime.render(hook);
    expect(result.services).toEqual([]);
    expect(result.pagesSearched).toBe(1);
    expect(result.resourcesSearched).toBe(620);
    expect(result.isSearching).toBe(false);
    expect(result.hasMore).toBe(false);

    fetchMock.mockResolvedValueOnce({ items: [] });
    query = "another-missing-service";
    runtime.render(hook);
    await runtime.settle();
    result = runtime.render(hook);
    expect(result.pagesSearched).toBe(1);
    expect(result.resourcesSearched).toBe(0);
    query = "";
    runtime.render(hook);
    await runtime.settle();
    result = runtime.render(hook);
    expect(result.pagesSearched).toBe(0);
    expect(result.resourcesSearched).toBe(0);
    expect(result.services).toHaveLength(50);
  });

  it("rejects load-more actions retained from a different project", async () => {
    let projectId = "first-project";
    const hook = () => useSecretManager(projectId);
    runtime.render(hook);
    await runtime.settle();
    const previousLoadMore = runtime.render(hook).loadMore;
    projectId = "second-project";
    runtime.render(hook);
    await runtime.settle();
    await previousLoadMore();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(runtime.render(hook).secrets).toHaveLength(50);
  });

  it.each(hooks)("keeps all $count $name resources reachable and supports restarting", async ({ hook, count }) => {
    runtime.render(hook);
    await runtime.settle();
    let result: Result = runtime.render(hook);
    expect(result.items?.length).toBe(count === 620 ? 50 : 100);
    expect(fetchMock).toHaveBeenCalledTimes(count === 620 ? 1 : 2);
    const seen = new Set(result.items?.map(key));
    for (let page = 0; result.hasMore && page < 20; page++) {
      await result.loadMore();
      result = runtime.render(hook);
      result.items?.forEach((item) => seen.add(key(item)));
      expect(result.items?.length).toBeLessThanOrEqual(500);
      expect(result.error).toBeUndefined();
    }
    expect(seen.size).toBe(count);
    expect(result.items).toHaveLength(500);
    expect(result.hasMore).toBe(false);
    expect(result.isTruncated).toBe(true);
    const requests = fetchMock.mock.calls.length;
    await result.loadMore();
    expect(fetchMock).toHaveBeenCalledTimes(requests);
    await result.reload?.();
    result = runtime.render(hook);
    expect(result.items?.length).toBe(count === 620 ? 50 : 100);
    expect(result.hasMore).toBe(true);
    expect(result.isTruncated).toBe(false);
  });

  it("guards concurrent Secret Manager loads and ignores a response after restarting", async () => {
    const hook = () => useSecretManager("project");
    runtime.render(hook);
    await runtime.settle();
    let result = runtime.render(hook);
    let resolvePage!: (data: unknown) => void;
    fetchMock.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolvePage = resolve;
        }),
    );
    const first = result.loadMore();
    await result.loadMore();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(runtime.render(hook).isLoadingMore).toBe(true);
    await result.reload();
    resolvePage(
      pageResponse("https://secretmanager.googleapis.com/v1/projects/project/secrets?pageSize=50&pageToken=50"),
    );
    await first;
    result = runtime.render(hook);
    expect(result.secrets).toHaveLength(50);
    expect(result.secrets[0].name).toBe("secret-0");
    expect(result.isLoadingMore).toBe(false);
  });

  it("propagates a next-page failure without losing the continuation token", async () => {
    const hook = () => useSecretManager("project");
    runtime.render(hook);
    await runtime.settle();
    const failure = new Error("Next page failed");
    fetchMock.mockRejectedValueOnce(failure);
    await runtime.render(hook).loadMore();
    let result = runtime.render(hook);
    expect(result.error).toBe(failure);
    expect(result.secrets).toHaveLength(50);
    expect(result.hasMore).toBe(true);
    await result.loadMore();
    result = runtime.render(hook);
    expect(result.error).toBeUndefined();
    expect(result.secrets).toHaveLength(100);
  });

  it.each(["initial", "load-more"])(
    "exposes a Cloud Scheduler sign-in requirement during %s loading",
    async (stage) => {
      const failure = new GoogleAuthenticationRequiredError();
      let expired = stage === "initial";
      fetchMock.mockImplementation(async (url) => {
        if (expired && new URL(url).searchParams.has("legacyAppEngineCron")) throw failure;
        return pageResponse(url);
      });
      const hook = () => useCloudSchedulerJobs("project", "us-central1");
      runtime.render(hook);
      await runtime.settle();
      if (stage === "load-more") {
        expect(runtime.render(hook).scheduledJobs).toHaveLength(100);
        expired = true;
        await runtime.render(hook).loadMore();
      }
      expect(runtime.render(hook).error).toBe(failure);
    },
  );

  it("preserves Cloud Scheduler partial success when legacy jobs cannot be read", async () => {
    fetchMock.mockImplementation(async (url) => {
      const parsed = new URL(url);
      if (parsed.searchParams.has("legacyAppEngineCron")) throw new Error("Legacy jobs unavailable");
      if (!parsed.searchParams.has("pageToken")) return { jobs: [], nextPageToken: "50" };
      return pageResponse(url);
    });
    const hook = () => useCloudSchedulerJobs("project", "us-central1");
    runtime.render(hook);
    await runtime.settle();
    let result = runtime.render(hook);
    expect(result.error).toBeUndefined();
    expect(result.scheduledJobs).toEqual([]);
    expect(result.hasMore).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    await result.loadMore();
    result = runtime.render(hook);
    expect(result.scheduledJobs).toHaveLength(50);
    expect(result.hasMore).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("continues subscriptions after the topic stream is exhausted", async () => {
    fetchMock.mockImplementation(async (url) =>
      new URL(url).pathname.endsWith("topics") ? { topics: [] } : pageResponse(url),
    );
    const hook = () => usePubSubResources("project");
    runtime.render(hook);
    await runtime.settle();
    let result = runtime.render(hook);
    const seen = new Set(result.resources?.map(key));
    for (let page = 0; result.hasMore && page < 20; page++) {
      await result.loadMore();
      result = runtime.render(hook);
      result.resources?.forEach((item) => seen.add(key(item)));
    }
    expect(seen.size).toBe(620);
    expect(result.resources).toHaveLength(500);
    expect(result.hasMore).toBe(false);
    expect(fetchMock.mock.calls.filter(([url]) => new URL(url).pathname.endsWith("topics"))).toHaveLength(1);
  });
});

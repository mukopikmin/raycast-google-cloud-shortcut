import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchGoogleApi } from "../auth/api";
import { useSecretManager } from "../resources/secret-manager/useSecretManager";
import { useCloudRunServices } from "../resources/cloud-run/useCloudRunServices";
import { useCloudRunJobs } from "../resources/cloud-run/useCloudRunJobs";
import { useCloudRunWorkerPools } from "../resources/cloud-run/useCloudRunWorkerPools";
import { usePubSubResources } from "../resources/pubsub/usePubSubResources";
import { useCloudSchedulerJobs } from "../resources/cloud-scheduler/useCloudSchedulerJobs";

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
  useCallback: (callback: unknown, dependencies: unknown[]) => runtime.useMemo(() => callback, dependencies),
}));
vi.mock("@raycast/utils", () => ({ usePromise: runtime.usePromise }));
vi.mock("../auth/google", () => ({ useGoogleApi: () => ({ accessToken: "token" }) }));
vi.mock("../auth/api", () => ({ fetchGoogleApi: vi.fn() }));

const fetchMock = vi.mocked(fetchGoogleApi);
const pageResponse = (url: string) => {
  const parsed = new URL(url);
  const offset = Number(parsed.searchParams.get("pageToken") || parsed.searchParams.get("continue") || 0);
  const size = Number(parsed.searchParams.get("pageSize") || parsed.searchParams.get("limit"));
  const nextPageToken = offset + size < 620 ? String(offset + size) : undefined;
  const ids = Array.from({ length: Math.min(size, 620 - offset) }, (_, i) => String(offset + i));
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
    metadata: { continue: nextPageToken },
    unreachable: ["europe-west1"],
  };
};

const hooks: { name: string; count: number; hook: () => Result }[] = [
  {
    name: "Secret Manager",
    count: 620,
    hook: () => {
      const result = useSecretManager("project");
      return { ...result, items: result.secrets };
    },
  },
  {
    name: "Cloud Run services",
    count: 620,
    hook: () => {
      const result = useCloudRunServices("project");
      return { ...result, items: result.services };
    },
  },
  {
    name: "Cloud Run jobs",
    count: 620,
    hook: () => {
      const result = useCloudRunJobs("project");
      return { ...result, items: result.jobs };
    },
  },
  {
    name: "Cloud Run worker pools",
    count: 620,
    hook: () => {
      const result = useCloudRunWorkerPools("project");
      return { ...result, items: result.workerPools };
    },
  },
  {
    name: "Pub/Sub streams",
    count: 1240,
    hook: () => {
      const result = usePubSubResources("project");
      return { ...result, items: result.resources };
    },
  },
  {
    name: "Cloud Scheduler streams",
    count: 1240,
    hook: () => {
      const result = useCloudSchedulerJobs("project", "us-central1");
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
  loadMore: () => Promise<void>;
  reload?: () => Promise<void>;
  error: Error | undefined;
};
const key = (item: Item) => item.id ?? `${item.resourceType ?? ""}/${item.name}`;

describe("resource pagination beyond 500", () => {
  beforeEach(() => {
    runtime.reset();
    fetchMock.mockReset();
    fetchMock.mockImplementation(async (url) => pageResponse(url));
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

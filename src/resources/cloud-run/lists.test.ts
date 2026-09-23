import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const readSource = (file: string) => readFileSync(`src/${file}`, "utf8");

describe("Cloud Run resource lists", () => {
  it("loads additional pages only through the explicit Load More action", () => {
    const source = readSource("resources/cloud-run/CloudRunDeploymentList.tsx");

    expect(source).not.toContain("useLoadMoreOnSearch");
    expect(source).not.toContain("pagination=");
    expect(source).toContain("onAction={loadMore}");
  });

  it.each([
    ["CloudRunServicesList.tsx", "useCloudRunServices"],
    ["CloudRunJobsList.tsx", "useCloudRunJobs"],
    ["CloudRunWorkerPoolsList.tsx", "useCloudRunWorkerPools"],
  ])("uses only the matching API hook in %s", (file, expectedHook) => {
    const source = readSource(`resources/cloud-run/${file}`);
    const importedHooks = [...source.matchAll(/import \{ (useCloudRun(?:Services|Jobs|WorkerPools)) \}/g)].map(
      ([, hook]) => hook,
    );

    expect(importedHooks).toEqual([expectedHook]);
    expect(source).toContain(`${expectedHook}(projectId)`);
  });

  it.each([
    ["Cloud Run Services", "CloudRunServicesList"],
    ["Cloud Run Jobs", "CloudRunJobsList"],
    ["Cloud Run Worker Pools", "CloudRunWorkerPoolsList"],
  ])("connects %s to its matching list", (serviceName, expectedList) => {
    const source = readSource("service/useServiceResource.tsx");
    const serviceCase = source.slice(source.indexOf(`case "${serviceName}":`));
    const nextCase = serviceCase.indexOf("case ", 5);

    expect(serviceCase.slice(0, nextCase < 0 ? undefined : nextCase)).toContain(
      `<${expectedList} projectId={projectId}`,
    );
  });
});

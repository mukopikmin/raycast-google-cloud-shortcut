import { describe, expect, it } from "vitest";
import { createCloudBuild } from "./types";

describe("createCloudBuild", () => {
  it("creates a regionalized Console URL for a build", () => {
    expect(
      createCloudBuild({
        id: "build-id",
        projectId: "sample-project",
        status: "SUCCESS",
        createTime: "2026-07-11T00:00:00Z",
        triggerName: "deploy",
        region: "global",
      }),
    ).toMatchObject({
      url: "https://console.cloud.google.com/cloud-build/builds;region=global/build-id?project=sample-project",
      keywords: ["build-id", "SUCCESS", "deploy"],
    });
  });
});

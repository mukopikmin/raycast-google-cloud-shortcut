import { describe, expect, it } from "vitest";
import { createCloudRunExecutionsUrl, createCloudRunRevisionsUrl } from "./urls";

describe("Cloud Run Console URLs", () => {
  it("creates a service revisions URL", () => {
    expect(createCloudRunRevisionsUrl("sample-project", "asia-northeast1", "api-service")).toBe(
      "https://console.cloud.google.com/run/detail/asia-northeast1/api-service/revisions?project=sample-project",
    );
  });

  it("creates a job executions URL", () => {
    expect(createCloudRunExecutionsUrl("sample-project", "us-central1", "daily-job")).toBe(
      "https://console.cloud.google.com/run/jobs/details/us-central1/daily-job/executions?project=sample-project",
    );
  });
});

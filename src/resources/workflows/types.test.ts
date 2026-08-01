import { describe, expect, it } from "vitest";
import { createWorkflow } from "./types";

describe("createWorkflow", () => {
  it("creates a Console URL for a regional workflow", () => {
    expect(
      createWorkflow({
        projectId: "sample-project",
        name: "invoice-flow",
        region: "asia-northeast1",
        description: "Process invoices",
      }),
    ).toMatchObject({
      name: "invoice-flow",
      region: "asia-northeast1",
      description: "Process invoices",
      url: "https://console.cloud.google.com/workflows/workflow/asia-northeast1/invoice-flow?project=sample-project",
    });
  });
});

import { describe, expect, it } from "vitest";
import { createDatastoreDatabase } from "./types";

describe("Datastore database", () => {
  it("creates an encoded Datastore Entities URL", () => {
    expect(
      createDatastoreDatabase({
        projectId: "project id",
        database: {
          id: "(default)",
          location: "us-central1",
          type: "DATASTORE_MODE",
          edition: "STANDARD",
        },
      }),
    ).toEqual({
      id: "(default)",
      location: "us-central1",
      edition: "STANDARD",
      url: "https://console.cloud.google.com/datastore/entities/query?project=project+id&database=%28default%29",
    });
  });
});

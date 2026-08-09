import { describe, expect, it } from "vitest";
import { createFirestoreDatabase } from "./types";

describe("Firestore database", () => {
  it.each([
    ["(default)", "-default-"],
    ["database name", "database%20name"],
  ])("creates a Firestore Studio URL for %s", (databaseId, consoleDatabaseId) => {
    expect(
      createFirestoreDatabase({
        projectId: "project id",
        database: {
          id: databaseId,
          location: "nam5",
          type: "FIRESTORE_NATIVE",
          edition: "ENTERPRISE",
        },
      }),
    ).toEqual({
      id: databaseId,
      location: "nam5",
      edition: "ENTERPRISE",
      url: `https://console.cloud.google.com/firestore/databases/${consoleDatabaseId}/data/panel?project=project+id`,
    });
  });
});

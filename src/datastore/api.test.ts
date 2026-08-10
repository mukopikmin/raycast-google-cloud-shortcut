import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchGoogleApi } from "../auth/api";
import { listDatastoreDatabases } from "./api";

vi.mock("../auth/api", () => ({ fetchGoogleApi: vi.fn() }));

const fetchGoogleApiMock = vi.mocked(fetchGoogleApi);

describe("Datastore API", () => {
  beforeEach(() => fetchGoogleApiMock.mockReset());

  it("lists only Datastore mode databases", async () => {
    fetchGoogleApiMock.mockResolvedValueOnce({
      databases: [
        {
          name: "projects/sample-project/databases/(default)",
          locationId: "us-central1",
          type: "DATASTORE_MODE",
          databaseEdition: "STANDARD",
        },
        {
          name: "projects/sample-project/databases/native-database",
          locationId: "nam5",
          type: "FIRESTORE_NATIVE",
          databaseEdition: "STANDARD",
        },
      ],
    });

    await expect(listDatastoreDatabases("sample-project", "access-token")).resolves.toEqual([
      {
        id: "(default)",
        location: "us-central1",
        edition: "STANDARD",
        url: "https://console.cloud.google.com/datastore/entities/query?project=sample-project&database=%28default%29",
      },
    ]);
    expect(fetchGoogleApiMock).toHaveBeenCalledWith(
      "https://firestore.googleapis.com/v1/projects/sample-project/databases",
      "access-token",
    );
  });

  it("returns an empty list when databases are absent", async () => {
    fetchGoogleApiMock.mockResolvedValueOnce({ unreachable: ["projects/sample-project/locations/us-central1"] });

    await expect(listDatastoreDatabases("sample-project", "access-token")).resolves.toEqual([]);
  });

  it("encodes project and database identifiers in URLs", async () => {
    fetchGoogleApiMock.mockResolvedValueOnce({
      databases: [{ name: "projects/project id/databases/database name", type: "DATASTORE_MODE" }],
    });

    await expect(listDatastoreDatabases("project id", "access-token")).resolves.toEqual([
      {
        id: "database name",
        location: undefined,
        edition: undefined,
        url: "https://console.cloud.google.com/datastore/entities/query?project=project+id&database=database+name",
      },
    ]);
    expect(fetchGoogleApiMock).toHaveBeenCalledWith(
      "https://firestore.googleapis.com/v1/projects/project%20id/databases",
      "access-token",
    );
  });
});

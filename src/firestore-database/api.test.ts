import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchGoogleApi } from "../auth/api";
import { listGoogleCloudDatabases } from "./api";

vi.mock("../auth/api", () => ({ fetchGoogleApi: vi.fn() }));

const fetchGoogleApiMock = vi.mocked(fetchGoogleApi);

describe("Firestore database API", () => {
  beforeEach(() => fetchGoogleApiMock.mockReset());

  it.each([
    [
      "DATASTORE_MODE",
      [
        {
          id: "datastore-database",
          location: "us-central1",
          type: "DATASTORE_MODE",
          edition: "STANDARD",
        },
      ],
    ],
    [
      "FIRESTORE_NATIVE",
      [
        {
          id: "firestore-database",
          location: "nam5",
          type: "FIRESTORE_NATIVE",
          edition: "ENTERPRISE",
        },
        {
          id: "standard-database",
          location: "eur3",
          type: "FIRESTORE_NATIVE",
          edition: "STANDARD",
        },
      ],
    ],
  ] as const)("lists only %s databases", async (databaseType, expectedDatabases) => {
    fetchGoogleApiMock.mockResolvedValueOnce({
      databases: [
        {
          name: "projects/sample-project/databases/datastore-database",
          locationId: "us-central1",
          type: "DATASTORE_MODE",
          databaseEdition: "STANDARD",
        },
        {
          name: "projects/sample-project/databases/firestore-database",
          locationId: "nam5",
          type: "FIRESTORE_NATIVE",
          databaseEdition: "ENTERPRISE",
        },
        {
          name: "projects/sample-project/databases/standard-database",
          locationId: "eur3",
          type: "FIRESTORE_NATIVE",
          databaseEdition: "STANDARD",
        },
      ],
    });

    const databases = await listGoogleCloudDatabases("sample-project", "access-token", databaseType);

    expect(databases).toEqual(expectedDatabases);
    expect(fetchGoogleApiMock).toHaveBeenCalledWith(
      "https://firestore.googleapis.com/v1/projects/sample-project/databases",
      "access-token",
    );
  });

  it("returns an empty list when databases are absent", async () => {
    fetchGoogleApiMock.mockResolvedValueOnce({ unreachable: ["projects/sample-project/locations/us-central1"] });

    await expect(listGoogleCloudDatabases("sample-project", "access-token", "FIRESTORE_NATIVE")).resolves.toEqual([]);
  });

  it("encodes the project ID", async () => {
    fetchGoogleApiMock.mockResolvedValueOnce({});

    await listGoogleCloudDatabases("project id", "access-token", "FIRESTORE_NATIVE");

    expect(fetchGoogleApiMock).toHaveBeenCalledWith(
      "https://firestore.googleapis.com/v1/projects/project%20id/databases",
      "access-token",
    );
  });
});

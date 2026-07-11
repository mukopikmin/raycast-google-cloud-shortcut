import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchGoogleApi } from "../auth/api";
import { fetchServiceAccounts } from "./api";

vi.mock("../auth/api", () => ({ fetchGoogleApi: vi.fn() }));

const fetchGoogleApiMock = vi.mocked(fetchGoogleApi);

describe("Service Account API", () => {
  beforeEach(() => fetchGoogleApiMock.mockReset());

  it("creates Console URLs from service account unique IDs", async () => {
    fetchGoogleApiMock.mockResolvedValueOnce({
      accounts: [
        {
          uniqueId: "123456789012345678901",
          displayName: "Deploy Bot",
          email: "deploy-bot@sample-project.iam.gserviceaccount.com",
        },
      ],
    });

    await expect(fetchServiceAccounts("sample-project", "access-token")).resolves.toEqual([
      {
        id: "123456789012345678901",
        name: "Deploy Bot",
        email: "deploy-bot@sample-project.iam.gserviceaccount.com",
        url: "https://console.cloud.google.com/iam-admin/serviceaccounts/details/123456789012345678901?project=sample-project",
        keywords: ["123456789012345678901", "Deploy Bot", "deploy-bot@sample-project.iam.gserviceaccount.com"],
      },
    ]);
  });
});

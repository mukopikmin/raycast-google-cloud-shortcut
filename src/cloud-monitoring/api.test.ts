import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchGoogleApi } from "../auth/api";
import { listAlertPoliciesPage } from "./api";

vi.mock("../auth/api", () => ({ fetchGoogleApi: vi.fn() }));

const fetchGoogleApiMock = vi.mocked(fetchGoogleApi);

describe("Cloud Monitoring API", () => {
  beforeEach(() => fetchGoogleApiMock.mockReset());

  it("lists a page of alert policies", async () => {
    fetchGoogleApiMock.mockResolvedValueOnce({
      nextPageToken: "next-page",
      alertPolicies: [
        {
          name: "projects/sample-project/alertPolicies/123",
          displayName: "High error rate",
          enabled: true,
          severity: "ERROR",
          conditions: [{ displayName: "5xx errors" }],
        },
      ],
    });

    const page = await listAlertPoliciesPage("sample-project", "access-token", {
      pageSize: 50,
      pageToken: "current-page",
    });

    expect(fetchGoogleApiMock).toHaveBeenCalledWith(
      "https://monitoring.googleapis.com/v3/projects/sample-project/alertPolicies?pageSize=50&pageToken=current-page",
      "access-token",
    );
    expect(page).toEqual({
      nextPageToken: "next-page",
      alertPolicies: [
        {
          id: "123",
          displayName: "High error rate",
          enabled: true,
          severity: "ERROR",
          conditionCount: 1,
          url: "https://console.cloud.google.com/monitoring/alerting/policies/123?project=sample-project",
          keywords: ["123", "High error rate", "ERROR", "5xx errors"],
        },
      ],
    });
  });

  it("returns an empty page when alert policies are absent", async () => {
    fetchGoogleApiMock.mockResolvedValueOnce({});

    await expect(listAlertPoliciesPage("sample-project", "access-token", { pageSize: 50 })).resolves.toEqual({
      alertPolicies: [],
      nextPageToken: undefined,
    });
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchGoogleApi } from "./api";
import { refreshGoogleAccessToken } from "./google";

vi.mock("./google", () => ({ refreshGoogleAccessToken: vi.fn() }));

const fetchMock = vi.fn<typeof fetch>();

describe("Google API authentication recovery", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubGlobal("fetch", fetchMock);
    vi.mocked(refreshGoogleAccessToken).mockResolvedValue("new-access");
  });
  afterEach(() => vi.unstubAllGlobals());

  it("retries a rejected request with the recovered token", async () => {
    fetchMock
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(Response.json({ items: [] }));
    await expect(fetchGoogleApi("https://example.com", "old-access")).resolves.toEqual({ items: [] });
    expect(refreshGoogleAccessToken).toHaveBeenCalledWith("old-access");
    expect(fetchMock).toHaveBeenLastCalledWith("https://example.com", {
      headers: { Authorization: "Bearer new-access" },
    });
  });

  it("reports the retry error instead of the original 401", async () => {
    fetchMock
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(Response.json({ error: "denied" }, { status: 403 }));
    await expect(fetchGoogleApi("https://example.com", "old-access")).rejects.toThrow("Forbidden (403)");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("does not loop when the new token is also rejected", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 401 }));
    await expect(fetchGoogleApi("https://example.com", "old-access")).rejects.toThrow("Unauthorized (401)");
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(refreshGoogleAccessToken).toHaveBeenCalledOnce();
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const service = vi.hoisted(() => ({
  client: { getTokens: vi.fn(), setTokens: vi.fn(), removeTokens: vi.fn() },
  authorize: vi.fn(),
  refreshTokens: vi.fn(),
}));

vi.mock("@raycast/utils", () => ({
  OAuthService: { google: () => service },
  withAccessToken: vi.fn(() => vi.fn()),
  getAccessToken: vi.fn(() => ({ token: "old-token" })),
}));

import { authorizeGoogle, refreshGoogleAccessToken } from "./google";
import { fetchGoogleApi } from "./api";

type Tokens = { accessToken: string; refreshToken?: string; isExpired: () => boolean };
let stored: Tokens | undefined;
const saveNewTokens = () => {
  stored = { accessToken: "new-token", refreshToken: "new-refresh", isExpired: () => false };
};

beforeEach(() => {
  vi.resetAllMocks();
  stored = { accessToken: "old-token", refreshToken: "old-refresh", isExpired: () => true };
  service.client.getTokens.mockImplementation(async () => stored);
  service.client.removeTokens.mockImplementation(async () => {
    stored = undefined;
  });
  service.client.setTokens.mockImplementation(async (tokens) => {
    stored = { accessToken: tokens.access_token, refreshToken: tokens.refresh_token, isExpired: () => false };
  });
});

afterEach(() => vi.unstubAllGlobals());

describe("Google authentication recovery", () => {
  it("reads the saved token when SDK authorization returns the old token after signing in", async () => {
    service.authorize.mockImplementation(async () => {
      saveNewTokens();
      return "old-token";
    });
    await expect(authorizeGoogle()).resolves.toBe("new-token");
  });

  it("reauthorizes expired tokens without a refresh token", async () => {
    stored = { accessToken: "old-token", isExpired: () => true };
    service.authorize.mockImplementation(async () => {
      expect(stored).toBeUndefined();
      saveNewTokens();
      return "new-token";
    });
    await expect(authorizeGoogle()).resolves.toBe("new-token");
  });

  it("recovers after refresh triggers sign-in and returns undefined", async () => {
    service.refreshTokens.mockImplementation(async () => {
      saveNewTokens();
      return undefined;
    });
    await expect(refreshGoogleAccessToken("old-token")).resolves.toBe("new-token");
    expect(service.client.setTokens).not.toHaveBeenCalled();
  });

  it("persists a normal refresh response", async () => {
    service.refreshTokens.mockResolvedValue({ access_token: "new-token", refresh_token: "old-refresh" });
    await expect(refreshGoogleAccessToken("old-token")).resolves.toBe("new-token");
    expect(stored?.accessToken).toBe("new-token");
  });

  it("shares recovery across simultaneous rejected requests", async () => {
    service.refreshTokens.mockImplementation(async () => {
      saveNewTokens();
    });
    await expect(Promise.all(Array.from({ length: 10 }, () => refreshGoogleAccessToken("old-token")))).resolves.toEqual(
      Array(10).fill("new-token"),
    );
    expect(service.refreshTokens).toHaveBeenCalledTimes(1);
    await expect(refreshGoogleAccessToken("old-token")).resolves.toBe("new-token");
    expect(service.refreshTokens).toHaveBeenCalledTimes(1);
  });

  it("signs in on 401 when there is no refresh token", async () => {
    stored = { accessToken: "old-token", isExpired: () => false };
    service.authorize.mockImplementation(async () => {
      saveNewTokens();
      return "new-token";
    });
    await expect(refreshGoogleAccessToken("old-token")).resolves.toBe("new-token");
    expect(service.client.removeTokens).toHaveBeenCalledTimes(1);
  });

  it("allows recovery to be retried after a canceled sign-in", async () => {
    service.refreshTokens.mockRejectedValueOnce(new Error("Canceled"));
    await expect(refreshGoogleAccessToken("old-token")).rejects.toThrow("Canceled");
    service.refreshTokens.mockImplementation(async () => {
      saveNewTokens();
    });
    await expect(refreshGoogleAccessToken("old-token")).resolves.toBe("new-token");
  });

  it("retries with the new token and uses it for later calls with a stale hook token", async () => {
    service.refreshTokens.mockImplementation(async () => {
      saveNewTokens();
    });
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response("{}", { status: 401 }))
      .mockImplementation(async () => new Response('{"ok":true}'));
    vi.stubGlobal("fetch", fetchMock);
    await expect(fetchGoogleApi("https://example.test", "old-token")).resolves.toEqual({ ok: true });
    await expect(fetchGoogleApi("https://example.test", "old-token")).resolves.toEqual({ ok: true });
    expect(fetchMock.mock.calls.map((call) => call[1]?.headers)).toEqual([
      { Authorization: "Bearer old-token" },
      { Authorization: "Bearer new-token" },
      { Authorization: "Bearer new-token" },
    ]);
    expect(service.refreshTokens).toHaveBeenCalledTimes(1);
  });

  it.each([401, 403, 500])("reports the retry response (%s) without looping", async (status) => {
    service.refreshTokens.mockImplementation(async () => {
      saveNewTokens();
    });
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response("{}", { status: 401 }))
      .mockResolvedValueOnce(new Response("{}", { status }));
    vi.stubGlobal("fetch", fetchMock);
    await expect(fetchGoogleApi("https://example.test", "old-token")).rejects.toThrow(`(${status})`);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

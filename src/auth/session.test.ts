import type { OAuth } from "@raycast/api";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createGoogleSession } from "./session";

const tokenSet = (accessToken = "old-access", expired = true, refreshToken: string | undefined = "refresh") =>
  ({ accessToken, refreshToken, isExpired: () => expired }) as OAuth.TokenSet;

describe("Google session recovery", () => {
  let stored: OAuth.TokenSet | undefined;
  const client = {
    getTokens: vi.fn(async () => stored),
    setTokens: vi.fn(async (tokens: OAuth.TokenResponse | OAuth.TokenSetOptions) => {
      if ("access_token" in tokens) stored = tokenSet(tokens.access_token, false, tokens.refresh_token);
    }),
    removeTokens: vi.fn(async () => {
      stored = undefined;
    }),
  };
  const authorize = vi.fn(async () => {
    // The SDK must only see a fresh login, never its broken refresh branch.
    expect(stored).toBeUndefined();
    stored = tokenSet("reauthorized-access", false);
    return stored.accessToken;
  });
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.clearAllMocks();
    fetchMock.mockReset();
    stored = tokenSet();
    vi.stubGlobal("fetch", fetchMock);
  });
  afterEach(() => vi.unstubAllGlobals());

  it("uses valid credentials without refreshing or showing login", async () => {
    stored = tokenSet("valid", false);
    const session = createGoogleSession({ client, authorize }, "client");
    await expect(session.authorize()).resolves.toBe("valid");
    expect(fetchMock).not.toHaveBeenCalled();
    expect(authorize).not.toHaveBeenCalled();
  });

  it("refreshes expired access tokens and preserves the refresh token", async () => {
    fetchMock.mockResolvedValue(Response.json({ access_token: "refreshed", expires_in: 3600 }));
    const session = createGoogleSession({ client, authorize }, "client");
    await expect(session.authorize()).resolves.toBe("refreshed");
    expect(client.setTokens).toHaveBeenCalledWith({
      access_token: "refreshed",
      refresh_token: "refresh",
      expires_in: 3600,
    });
    expect(authorize).not.toHaveBeenCalled();
  });

  it.each(["authorize", "refresh"] as const)(
    "returns the new login token after invalid_rapt via %s",
    async (method) => {
      fetchMock.mockResolvedValue(
        Response.json({ error: "invalid_grant", error_subtype: "invalid_rapt" }, { status: 400 }),
      );
      const session = createGoogleSession({ client, authorize }, "client");
      await expect(session[method]()).resolves.toBe("reauthorized-access");
      expect(session.getAccessToken()).toBe("reauthorized-access");
      expect(client.removeTokens).toHaveBeenCalledOnce();
      expect(authorize).toHaveBeenCalledOnce();
    },
  );

  it("shares simultaneous recovery and reuses the token for late 401 responses", async () => {
    fetchMock.mockResolvedValue(Response.json({ error: "invalid_grant" }, { status: 400 }));
    const session = createGoogleSession({ client, authorize }, "client");
    await expect(Promise.all([session.refresh("old-access"), session.refresh("old-access")])).resolves.toEqual([
      "reauthorized-access",
      "reauthorized-access",
    ]);
    await expect(session.refresh("old-access")).resolves.toBe("reauthorized-access");
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(authorize).toHaveBeenCalledOnce();
  });

  it.each([429, 500])("preserves credentials on transient HTTP %s errors and allows retry", async (status) => {
    fetchMock.mockResolvedValueOnce(new Response("Unavailable", { status }));
    const session = createGoogleSession({ client, authorize }, "client");
    await expect(session.authorize()).rejects.toThrow(`(${status})`);
    expect(client.removeTokens).not.toHaveBeenCalled();
    expect(authorize).not.toHaveBeenCalled();
    fetchMock.mockResolvedValueOnce(Response.json({ access_token: "retry-success" }));
    await expect(session.authorize()).resolves.toBe("retry-success");
  });

  it("preserves credentials on network failures", async () => {
    fetchMock.mockRejectedValueOnce(new Error("Network unavailable"));
    await expect(createGoogleSession({ client, authorize }, "client").authorize()).rejects.toThrow(
      "Network unavailable",
    );
    expect(client.removeTokens).not.toHaveBeenCalled();
  });

  it("reauthenticates expired credentials without a refresh token", async () => {
    stored = { ...tokenSet(), refreshToken: undefined };
    await expect(createGoogleSession({ client, authorize }, "client").authorize()).resolves.toBe("reauthorized-access");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("authenticates a first-time user", async () => {
    stored = undefined;
    await expect(createGoogleSession({ client, authorize }, "client").authorize()).resolves.toBe("reauthorized-access");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

import type { OAuth } from "@raycast/api";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createGoogleSession } from "./session";
import { GoogleAuthenticationRequiredError } from "./GoogleAuthenticationRequiredError";

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
    // A fresh PKCE flow replaces saved credentials only after it succeeds.
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

  it("returns the new login token after invalid_rapt at the command entry", async () => {
    fetchMock.mockResolvedValue(
      Response.json({ error: "invalid_grant", error_subtype: "invalid_rapt" }, { status: 400 }),
    );
    const session = createGoogleSession({ client, authorize }, "client");
    await expect(session.authorize()).resolves.toBe("reauthorized-access");
    expect(session.getAccessToken()).toBe("reauthorized-access");
    expect(client.removeTokens).not.toHaveBeenCalled();
    expect(authorize).toHaveBeenCalledOnce();
  });

  it.each(["authorizeSilently", "refresh"] as const)(
    "requests command-level authentication instead of opening OAuth from %s",
    async (method) => {
      fetchMock.mockImplementation(async () =>
        Response.json({ error: "invalid_grant", error_subtype: "invalid_rapt" }, { status: 400 }),
      );
      const session = createGoogleSession({ client, authorize }, "client");
      await expect(session[method]()).rejects.toBeInstanceOf(GoogleAuthenticationRequiredError);
      expect(client.removeTokens).not.toHaveBeenCalled();
      expect(authorize).not.toHaveBeenCalled();
      // Only the command entry is allowed to show the native OAuth overlay.
      await expect(session.authorize()).resolves.toBe("reauthorized-access");
      expect(authorize).toHaveBeenCalledOnce();
    },
  );

  it.each(["authorizeSilently", "refresh"] as const)(
    "does not open OAuth for missing tokens via %s",
    async (method) => {
      stored = undefined;
      const session = createGoogleSession({ client, authorize }, "client");
      await expect(session[method]()).rejects.toBeInstanceOf(GoogleAuthenticationRequiredError);
      expect(fetchMock).not.toHaveBeenCalled();
      expect(authorize).not.toHaveBeenCalled();
    },
  );

  it("shares simultaneous recovery and reuses the token for late 401 responses", async () => {
    fetchMock.mockResolvedValue(Response.json({ access_token: "refreshed-access" }));
    const session = createGoogleSession({ client, authorize }, "client");
    await expect(Promise.all([session.refresh("old-access"), session.refresh("old-access")])).resolves.toEqual([
      "refreshed-access",
      "refreshed-access",
    ]);
    await expect(session.refresh("old-access")).resolves.toBe("refreshed-access");
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(authorize).not.toHaveBeenCalled();
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

  it("explicit sign-in bypasses token validation and refresh", async () => {
    stored = tokenSet("rejected-but-unexpired", false);
    const session = createGoogleSession({ client, authorize }, "client");
    await expect(session.signIn()).resolves.toBe("reauthorized-access");
    expect(client.getTokens).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(client.removeTokens).not.toHaveBeenCalled();
    expect(authorize).toHaveBeenCalledOnce();
  });

  it("lets a separate command read saved credentials without repeating interactive authorization", async () => {
    const signInSession = createGoogleSession({ client, authorize }, "client");
    await expect(signInSession.signIn()).resolves.toBe("reauthorized-access");
    const resourceSession = createGoogleSession({ client, authorize }, "client");
    expect(resourceSession.getAccessToken()).toBeUndefined();
    await expect(resourceSession.authorizeSilently()).resolves.toBe("reauthorized-access");
    expect(resourceSession.getAccessToken()).toBe("reauthorized-access");
    expect(authorize).toHaveBeenCalledOnce();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

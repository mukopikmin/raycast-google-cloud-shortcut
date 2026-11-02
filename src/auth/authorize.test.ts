import type { OAuth } from "@raycast/api";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createGoogleAuthorization, GOOGLE_SCOPE } from "./authorize";

const request = {
  codeVerifier: "pkce-verifier",
  redirectURI: "com.raycast:/oauth?package_name=Extension",
} as OAuth.AuthorizationRequest;
const savedTokens = { access_token: "old-access", refresh_token: "old-refresh" };
const newTokens = { access_token: "new-access", refresh_token: "new-refresh", expires_in: 3600 };
const fetchMock = vi.fn<typeof fetch>();

describe("fresh Google PKCE authorization", () => {
  let stored = savedTokens;
  const client = {
    authorizationRequest: vi.fn(async () => request),
    authorize: vi.fn(async () => ({ authorizationCode: "authorization-code" })),
    setTokens: vi.fn(async (tokens: OAuth.TokenResponse | OAuth.TokenSetOptions) => {
      if ("access_token" in tokens) stored = tokens as typeof savedTokens;
    }),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    fetchMock.mockReset();
    stored = savedTokens;
    vi.stubGlobal("fetch", fetchMock);
  });
  afterEach(() => vi.unstubAllGlobals());

  it("starts a fresh PKCE flow and replaces tokens after a successful code exchange", async () => {
    fetchMock.mockResolvedValueOnce(Response.json(newTokens));
    await expect(createGoogleAuthorization(client, "client-id")()).resolves.toBe("new-access");
    expect(client.authorizationRequest).toHaveBeenCalledWith({
      endpoint: "https://accounts.google.com/o/oauth2/v2/auth",
      clientId: "client-id",
      scope: GOOGLE_SCOPE,
      extraParameters: { access_type: "offline", prompt: "consent" },
    });
    expect(client.authorize).toHaveBeenCalledWith(request);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe("https://oauth2.googleapis.com/token");
    expect(options?.method).toBe("POST");
    expect(Object.fromEntries(options?.body as URLSearchParams)).toEqual({
      client_id: "client-id",
      code: "authorization-code",
      code_verifier: "pkce-verifier",
      grant_type: "authorization_code",
      redirect_uri: request.redirectURI,
    });
    expect(client.setTokens).toHaveBeenCalledWith(newTokens);
    expect(stored).toEqual(newTokens);
  });

  it("leaves saved credentials intact when the user cancels sign-in", async () => {
    client.authorize.mockRejectedValueOnce(new Error("Authorization cancelled"));
    await expect(createGoogleAuthorization(client, "client-id")()).rejects.toThrow("Authorization cancelled");
    expect(fetchMock).not.toHaveBeenCalled();
    expect(client.setTokens).not.toHaveBeenCalled();
    expect(stored).toBe(savedTokens);
  });

  it("leaves saved credentials intact after a failed exchange and allows a fresh attempt", async () => {
    fetchMock.mockResolvedValueOnce(new Response("Bad request", { status: 400 }));
    const authorize = createGoogleAuthorization(client, "client-id");
    await expect(authorize()).rejects.toThrow("(400)");
    expect(client.setTokens).not.toHaveBeenCalled();
    expect(stored).toBe(savedTokens);
    fetchMock.mockResolvedValueOnce(Response.json(newTokens));
    await expect(authorize()).resolves.toBe("new-access");
    expect(client.authorizationRequest).toHaveBeenCalledTimes(2);
  });

  it.each([undefined, "", 42])("does not save an invalid access token: %s", async (access_token) => {
    fetchMock.mockResolvedValueOnce(Response.json({ access_token }));
    await expect(createGoogleAuthorization(client, "client-id")()).rejects.toThrow("no access token");
    expect(client.setTokens).not.toHaveBeenCalled();
    expect(stored).toBe(savedTokens);
  });
});

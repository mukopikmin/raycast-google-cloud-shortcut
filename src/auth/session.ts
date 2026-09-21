import type { OAuth } from "@raycast/api";

type OAuthProvider = {
  client: Pick<OAuth.PKCEClient, "getTokens" | "setTokens" | "removeTokens">;
  authorize: () => Promise<string>;
};

// Own refresh handling: OAuthService can discard the result of reauthorization
// after a failed refresh and return the expired access token instead.
export const createGoogleSession = (provider: OAuthProvider, clientId: string) => {
  let pending: Promise<string> | undefined;
  let accessToken: string | undefined;

  const acquire = async (forceRefresh: boolean, rejectedToken?: string): Promise<string> => {
    const tokens = await provider.client.getTokens();
    if (tokens?.accessToken) {
      if (rejectedToken && tokens.accessToken !== rejectedToken && !tokens.isExpired()) {
        return tokens.accessToken;
      }
      if (!forceRefresh && !tokens.isExpired()) return tokens.accessToken;

      if (tokens.refreshToken) {
        const response = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          body: new URLSearchParams({
            client_id: clientId,
            refresh_token: tokens.refreshToken,
            grant_type: "refresh_token",
          }),
        });
        if (response.ok) {
          const refreshed: OAuth.TokenResponse = await response.json();
          if (!refreshed.access_token) throw new Error("Google token refresh returned no access token.");
          await provider.client.setTokens({
            ...refreshed,
            refresh_token: refreshed.refresh_token ?? tokens.refreshToken,
          });
          return refreshed.access_token;
        }

        const failure = (await response.json().catch(() => undefined)) as { error?: string } | undefined;
        if (response.status !== 400 || failure?.error !== "invalid_grant") {
          throw new Error(`Google token refresh failed (${response.status}). Please try again.`);
        }
      }

      // Expired/rejected credentials cannot be refreshed. Start a fresh PKCE flow
      // and return its result, including for session-policy errors (invalid_rapt).
      await provider.client.removeTokens();
    }
    return provider.authorize();
  };

  const run = (forceRefresh: boolean, rejectedToken?: string): Promise<string> => {
    if (!pending) {
      pending = acquire(forceRefresh, rejectedToken)
        .then((token) => {
          accessToken = token;
          return token;
        })
        .finally(() => {
          pending = undefined;
        });
    }
    return pending;
  };

  return {
    authorize: () => run(false),
    refresh: (rejectedToken?: string) => run(true, rejectedToken),
    getAccessToken: () => accessToken,
  };
};

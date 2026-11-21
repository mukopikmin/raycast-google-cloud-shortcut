import type { OAuth } from "@raycast/api";
import { GoogleAuthenticationRequiredError } from "./GoogleAuthenticationRequiredError";
import { GoogleAuthenticationError } from "./GoogleAuthenticationError";

type OAuthProvider = {
  client: Pick<OAuth.PKCEClient, "getTokens" | "setTokens">;
  // Starts fresh PKCE authorization rather than reusing stored tokens.
  authorize: () => Promise<string>;
};

type Operation = "authorize" | "silent" | "refresh" | "sign-in";

// API requests refresh silently; views own interactive sign-in and recovery.
export const createGoogleSession = (provider: OAuthProvider, clientId: string) => {
  let pending: Promise<string> | undefined;
  let accessToken: string | undefined;

  const acquire = async (operation: Operation, rejectedToken?: string): Promise<string> => {
    if (operation === "sign-in") return provider.authorize();
    const interactive = operation === "authorize";
    const tokens = await provider.client.getTokens();
    if (tokens?.accessToken) {
      if (rejectedToken && tokens.accessToken !== rejectedToken && !tokens.isExpired()) {
        return tokens.accessToken;
      }
      if (operation !== "refresh" && !tokens.isExpired()) return tokens.accessToken;

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

      // API requests report a sign-in requirement to their view instead of
      // opening an OAuth overlay during an in-flight data request.
      if (!interactive) throw new GoogleAuthenticationRequiredError();
    }
    if (!interactive) throw new GoogleAuthenticationRequiredError();
    return provider.authorize();
  };

  const run = (operation: Operation, rejectedToken?: string): Promise<string> => {
    if (!pending) {
      pending = acquire(operation, rejectedToken)
        .then((token) => {
          accessToken = token;
          return token;
        })
        .catch((error: unknown) => {
          if (error instanceof GoogleAuthenticationError) throw error;
          throw new GoogleAuthenticationError(error instanceof Error ? error.message : String(error), { cause: error });
        })
        .finally(() => {
          pending = undefined;
        });
    }
    return pending;
  };

  return {
    authorize: () => run("authorize"),
    signIn: () => run("sign-in"),
    authorizeSilently: () => run("silent"),
    refresh: (rejectedToken?: string) => run("refresh", rejectedToken),
    getAccessToken: () => accessToken,
  };
};

import type { OAuth } from "@raycast/api";

export const GOOGLE_SCOPE = "https://www.googleapis.com/auth/cloud-platform";

type AuthorizationClient = Pick<OAuth.PKCEClient, "authorizationRequest" | "authorize" | "setTokens">;

// Start a new PKCE flow without removing the saved credentials first. They are
// replaced only after sign-in succeeds, and remain available if it is cancelled.
export const createGoogleAuthorization = (client: AuthorizationClient, clientId: string) => async () => {
  const request = await client.authorizationRequest({
    endpoint: "https://accounts.google.com/o/oauth2/v2/auth",
    clientId,
    scope: GOOGLE_SCOPE,
    extraParameters: { access_type: "offline", prompt: "consent" },
  });
  const { authorizationCode } = await client.authorize(request);
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    body: new URLSearchParams({
      client_id: clientId,
      code: authorizationCode,
      code_verifier: request.codeVerifier,
      grant_type: "authorization_code",
      redirect_uri: request.redirectURI,
    }),
  });
  if (!response.ok) throw new Error(`Google sign-in token exchange failed (${response.status}). Please try again.`);
  const tokens: OAuth.TokenResponse = await response.json();
  if (typeof tokens.access_token !== "string" || !tokens.access_token)
    throw new Error("Google sign-in returned no access token.");
  await client.setTokens(tokens);
  return tokens.access_token;
};

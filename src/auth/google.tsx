import type { OAuth } from "@raycast/api";
import { getAccessToken, OAuthService, withAccessToken } from "@raycast/utils";

const OAUTH_CLIENT_ID = "943687027492-ljl37fkhv85e5h6uuevj16dvq4n721ga.apps.googleusercontent.com";

type AuthorizedGoogleApiClient = {
  authorized: true;
  accessToken: string;
};

export const google = OAuthService.google({
  clientId: OAUTH_CLIENT_ID,
  authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenUrl: "https://oauth2.googleapis.com/token",
  scope: ["https://www.googleapis.com/auth/cloud-platform"].join(" "),
});

export const getGoogleAccessToken = async (fallback: string): Promise<string> =>
  (await google.client.getTokens())?.accessToken ?? fallback;

export const authorizeGoogle = async (): Promise<string> => {
  const tokens = await google.client.getTokens();
  if (tokens?.isExpired() && !tokens.refreshToken) {
    await google.client.removeTokens();
  }
  const token = await google.authorize();
  // The SDK can return the old token after its refresh flow triggers a new sign-in.
  return getGoogleAccessToken(token);
};

export const withGoogleAccessToken = withAccessToken({ client: google.client, authorize: authorizeGoogle });

type RefreshableOAuthService = OAuthService & {
  refreshTokens(args: { token: string }): Promise<OAuth.TokenResponse | undefined>;
};

const refreshAccessToken = async (rejectedToken: string): Promise<string | undefined> => {
  const tokens = await google.client.getTokens();
  if (tokens?.accessToken && tokens.accessToken !== rejectedToken) {
    return tokens.accessToken;
  }
  const refreshToken = tokens?.refreshToken;

  if (!refreshToken) {
    await google.client.removeTokens();
    return authorizeGoogle();
  }

  const refreshedTokens = await (google as RefreshableOAuthService).refreshTokens({ token: refreshToken });
  if (refreshedTokens?.access_token) {
    await google.client.setTokens(refreshedTokens);
  }

  // refreshTokens returns undefined when it has completed an interactive sign-in.
  const accessToken = (await google.client.getTokens())?.accessToken;
  return accessToken !== rejectedToken ? accessToken : undefined;
};

let pendingRefresh: Promise<string | undefined> | undefined;

export const refreshGoogleAccessToken = (rejectedToken: string): Promise<string | undefined> => {
  // Regional requests can all receive 401 together; share one refresh/sign-in flow.
  pendingRefresh ??= refreshAccessToken(rejectedToken).finally(() => {
    pendingRefresh = undefined;
  });
  return pendingRefresh;
};

export const useGoogleApi = (): AuthorizedGoogleApiClient => {
  const { token } = getAccessToken();

  return {
    authorized: true,
    accessToken: token,
  };
};

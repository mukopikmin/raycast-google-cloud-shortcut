import { getAccessToken, OAuthService, withAccessToken } from "@raycast/utils";
import { createGoogleSession } from "./session";

const OAUTH_CLIENT_ID = "943687027492-ljl37fkhv85e5h6uuevj16dvq4n721ga.apps.googleusercontent.com";

type AuthorizedGoogleApiClient = {
  authorized: true;
  accessToken: string;
};

const provider = OAuthService.google({
  clientId: OAUTH_CLIENT_ID,
  authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenUrl: "https://oauth2.googleapis.com/token",
  scope: ["https://www.googleapis.com/auth/cloud-platform"].join(" "),
});

const session = createGoogleSession(provider, OAUTH_CLIENT_ID);

export const google = { client: provider.client, authorize: session.authorize };
export const withGoogleAccessToken = withAccessToken(google);
export const refreshGoogleAccessToken = session.refresh;

export const useGoogleApi = (): AuthorizedGoogleApiClient => {
  const { token } = getAccessToken();

  return {
    authorized: true,
    accessToken: session.getAccessToken() ?? token,
  };
};

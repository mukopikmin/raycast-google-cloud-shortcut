import { withAccessToken, OAuthService } from "@raycast/utils";

const OAUTH_CLIENT_ID = "943687027492-ljl37fkhv85e5h6uuevj16dvq4n721ga.apps.googleusercontent.com";

type AuthorizedGoogleApiClient = {
  authorized: true;
  accessToken: string;
};

type UnauthorizedGoogleApiClient = {
  authorized: false;
};

type GoogleApiClient = AuthorizedGoogleApiClient | UnauthorizedGoogleApiClient;

let googleApi: GoogleApiClient = {
  authorized: false,
};

const google = OAuthService.google({
  clientId: OAUTH_CLIENT_ID,
  authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenUrl: "https://oauth2.googleapis.com/token",
  scope: ["https://www.googleapis.com/auth/cloud-platform"].join(" "),
  onAuthorize: ({ token }) => {
    googleApi = {
      authorized: true,
      accessToken: token,
    };
  },
});

export const withGoogleAccessToken = withAccessToken(google);

export const useGoogleApi = (): AuthorizedGoogleApiClient => {
  if (!googleApi.authorized) {
    throw new Error("Google API is not authorized yet");
  }

  return googleApi;
};

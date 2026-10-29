import type { ComponentType } from "react";
import { List } from "@raycast/api";
import { OAuthService, usePromise } from "@raycast/utils";
import { ErrorDetail } from "../components/ErrorDetail";
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

export const refreshGoogleAccessToken = session.refresh;

const withGoogleSession =
  (authorize: () => Promise<string>) =>
  <Props extends object>(Component: ComponentType<Props>) => {
    const WrappedComponent = (props: Props) => {
      // Keep authorization failures in view state instead of throwing a rejected
      // promise during rendering. Recheck credentials whenever a list is opened.
      const { data: accessToken, isLoading, error, revalidate } = usePromise(authorize, [], { onError: () => {} });

      if (isLoading) return <List isLoading />;
      if (error) {
        return (
          <ErrorDetail
            error={error}
            onRetry={async () => {
              await revalidate();
            }}
          />
        );
      }
      if (!accessToken) return <List isLoading />;

      return <Component {...props} />;
    };

    WrappedComponent.displayName = `withGoogleAccessToken(${Component.displayName || Component.name})`;
    return WrappedComponent;
  };

export const withGoogleCommandAccessToken = withGoogleSession(session.authorize);
export const withGoogleAccessToken = withGoogleSession(session.authorizeSilently);

export const getGoogleAccessToken = (): string => {
  const accessToken = session.getAccessToken();
  if (!accessToken) throw new Error("useGoogleApi must be used inside withGoogleAccessToken.");
  return accessToken;
};

export const useGoogleApi = (): AuthorizedGoogleApiClient => {
  return {
    authorized: true,
    accessToken: getGoogleAccessToken(),
  };
};

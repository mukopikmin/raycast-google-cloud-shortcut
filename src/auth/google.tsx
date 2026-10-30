import { useState, type ComponentType } from "react";
import { List } from "@raycast/api";
import { OAuthService, usePromise } from "@raycast/utils";
import { ErrorDetail } from "../components/ErrorDetail";
import { createGoogleSession } from "./session";
import { createGoogleAuthorization, GOOGLE_SCOPE } from "./authorize";

const OAUTH_CLIENT_ID = "943687027492-ljl37fkhv85e5h6uuevj16dvq4n721ga.apps.googleusercontent.com";

type AuthorizedGoogleApiClient = {
  authorized: true;
  accessToken: string;
};

const provider = OAuthService.google({
  clientId: OAUTH_CLIENT_ID,
  authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenUrl: "https://oauth2.googleapis.com/token",
  scope: GOOGLE_SCOPE,
});

const session = createGoogleSession(
  { client: provider.client, authorize: createGoogleAuthorization(provider.client, OAUTH_CLIENT_ID) },
  OAUTH_CLIENT_ID,
);

export const refreshGoogleAccessToken = session.refresh;

const withGoogleSession =
  (authorize: () => Promise<string>, signIn?: () => Promise<string>) =>
  <Props extends object>(Component: ComponentType<Props>) => {
    const WrappedComponent = (props: Props & { forceSignIn?: boolean }) => {
      const [signInAttempt, setSignInAttempt] = useState(0);
      const attempt = signInAttempt + (props.forceSignIn ? 1 : 0);
      // Keep authorization failures in view state instead of throwing a rejected
      // promise during rendering. Recheck credentials whenever a list is opened.
      const { data, isLoading, error, revalidate } = usePromise(
        async (attempt: number) => ({
          accessToken: await (signIn && attempt > 0 ? signIn() : authorize()),
          attempt,
        }),
        [attempt],
        { onError: () => {} },
      );

      if (isLoading || (data && data.attempt !== attempt)) return <List isLoading />;
      if (error) {
        return (
          <ErrorDetail
            error={error}
            onSignIn={
              signIn
                ? async () => {
                    setSignInAttempt((attempt) => attempt + 1);
                  }
                : undefined
            }
            onRetry={async () => {
              await revalidate();
            }}
          />
        );
      }
      if (!data?.accessToken) return <List isLoading />;

      return <Component {...props} />;
    };

    WrappedComponent.displayName = `withGoogleAccessToken(${Component.displayName || Component.name})`;
    return WrappedComponent;
  };

export const withGoogleCommandAccessToken = withGoogleSession(session.authorize, session.signIn);
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

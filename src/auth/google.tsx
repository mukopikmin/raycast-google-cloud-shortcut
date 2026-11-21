import { useCallback, useState, type ComponentType } from "react";
import { List } from "@raycast/api";
import { OAuthService, usePromise } from "@raycast/utils";
import { ErrorDetail } from "../components/ErrorDetail";
import { createGoogleSession } from "./session";
import { createGoogleAuthorization, GOOGLE_SCOPE } from "./authorize";
import { GoogleAuthenticationContext } from "./GoogleAuthenticationContext";

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
export const authorizeGoogleAccessToken = session.authorize;
export const signInToGoogle = session.signIn;

export const withGoogleAccessToken = <Props extends object>(Component: ComponentType<Props>) => {
  const WrappedComponent = (props: Props) => {
    const [signInAttempt, setSignInAttempt] = useState(0);
    const signIn = useCallback(async () => {
      setSignInAttempt((attempt) => attempt + 1);
    }, []);
    // Keep authorization failures in view state instead of throwing a rejected
    // promise during rendering. Recheck credentials whenever a list is opened.
    const { data, isLoading, error, revalidate } = usePromise(
      async (attempt: number) => ({
        accessToken: await (attempt > 0 ? session.signIn() : session.authorize()),
        attempt,
      }),
      [signInAttempt],
      { onError: () => {} },
    );

    if (isLoading || (data && data.attempt !== signInAttempt)) return <List isLoading />;
    if (error) {
      return (
        <ErrorDetail
          error={error}
          onSignIn={signIn}
          onRetry={async () => {
            await revalidate();
          }}
        />
      );
    }
    if (!data?.accessToken) return <List isLoading />;

    return (
      <GoogleAuthenticationContext.Provider value={signIn}>
        <Component {...props} />
      </GoogleAuthenticationContext.Provider>
    );
  };

  WrappedComponent.displayName = `withGoogleAccessToken(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

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

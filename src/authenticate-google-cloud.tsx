import { LaunchProps, List } from "@raycast/api";
import { usePromise } from "@raycast/utils";
import { withGoogleCommandAccessToken } from "./auth/google";
import { AuthenticationRequest, GoogleCloudLaunchContext, resumeAuthenticatedCommand } from "./auth/launch";
import { ErrorDetail } from "./components/ErrorDetail";

const DEFAULT_REQUEST: AuthenticationRequest = { type: "refresh-projects" };

const AuthenticatedReturn = withGoogleCommandAccessToken(({ request }: { request: AuthenticationRequest }) => {
  const { error, revalidate } = usePromise(resumeAuthenticatedCommand, [request], { onError: () => {} });

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

  return <List isLoading />;
});

export const AuthenticationCommand = ({ launchContext }: LaunchProps<{ launchContext: GoogleCloudLaunchContext }>) => (
  <AuthenticatedReturn
    request={launchContext?.authentication ?? DEFAULT_REQUEST}
    forceSignIn={launchContext?.forceSignIn ?? !launchContext?.authentication}
  />
);

export default AuthenticationCommand;

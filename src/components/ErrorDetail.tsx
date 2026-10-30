import { Action, ActionPanel, Detail, Icon } from "@raycast/api";
import { isGoogleAuthenticationError } from "../auth/GoogleAuthenticationError";
import { launchAuthenticatedCommand } from "../auth/launch";

type Props = {
  error: Error;
  onRetry?: () => Promise<void>;
  onSignIn?: () => Promise<void>;
};

export const ErrorDetail = ({ error, onRetry, onSignIn }: Props) => {
  const needsSignIn = isGoogleAuthenticationError(error);
  const signIn = onSignIn ?? (needsSignIn ? () => launchAuthenticatedCommand(undefined, true) : undefined);
  const markdown = `
# ${signIn ? "Google Sign-In" : "Error Fetching Data"}

**Message:**
${error.message}

${signIn ? "Press Enter to sign in to Google." : "Please make sure you have authenticated and selected the right project."}
  `;
  return (
    <Detail
      markdown={markdown.trim()}
      actions={
        signIn || onRetry ? (
          <ActionPanel>
            {signIn && <Action title="Sign in to Google" icon={Icon.Person} onAction={signIn} />}
            {onRetry && <Action title="Retry" icon={Icon.ArrowClockwise} onAction={onRetry} />}
          </ActionPanel>
        ) : undefined
      }
    />
  );
};

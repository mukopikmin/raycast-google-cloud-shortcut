import { Action, ActionPanel, Detail, Icon } from "@raycast/api";
import { GoogleAuthenticationRequiredError } from "../auth/GoogleAuthenticationRequiredError";
import { launchAuthenticatedCommand } from "../auth/launch";

type Props = {
  error: Error;
  onRetry?: () => Promise<void>;
};

export const ErrorDetail = ({ error, onRetry }: Props) => {
  const needsSignIn = error instanceof GoogleAuthenticationRequiredError;
  const retry = needsSignIn ? () => launchAuthenticatedCommand() : onRetry;
  const markdown = `
# Error Fetching Data

**Message:**
${error.message}

Please make sure you have authenticated and selected the right project.
  `;
  return (
    <Detail
      markdown={markdown.trim()}
      actions={
        retry ? (
          <ActionPanel>
            <Action title={needsSignIn ? "Sign in to Google" : "Retry"} icon={Icon.ArrowClockwise} onAction={retry} />
          </ActionPanel>
        ) : undefined
      }
    />
  );
};

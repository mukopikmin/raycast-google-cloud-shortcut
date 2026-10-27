import { Action, ActionPanel, Detail, Icon } from "@raycast/api";

type Props = {
  error: Error;
  onRetry?: () => Promise<void>;
};

export const ErrorDetail = ({ error, onRetry }: Props) => {
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
        onRetry ? (
          <ActionPanel>
            <Action title="Retry" icon={Icon.ArrowClockwise} onAction={onRetry} />
          </ActionPanel>
        ) : undefined
      }
    />
  );
};

import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { ErrorDetail } from "../components/ErrorDetail";
import { useErrorReporting } from "./useErrorReporting";

type Props = {
  projectId: string;
};

export const ErrorReportingErrorList = ({ projectId }: Props) => {
  const { errorGroups, isLoading, error } = useErrorReporting(projectId);

  if (error) {
    return <ErrorDetail error={error} />;
  }

  return (
    <List isLoading={isLoading} searchBarPlaceholder="Search errors...">
      {errorGroups?.map((group) => {
        // Extract the first line of the error message for the title
        const firstLine = group.representative.message.split("\n")[0];
        
        // Last seen time formatted locally + count
        const lastSeen = new Date(group.lastSeenTime).toLocaleString();
        const subtitle = `${lastSeen} • ${group.count} occurrences`;
        const url = group.url;

        return (
          <List.Item
            key={group.group.groupId}
            id={group.group.groupId}
            title={firstLine}
            subtitle={subtitle}
            icon={Icon.ExclamationMark}
            actions={
              <ActionPanel>
                <Action.OpenInBrowser url={url} />
                <Action.CopyToClipboard title="Copy Error Message" content={firstLine} />
              </ActionPanel>
            }
          />
        );
      })}
    </List>
  );
};

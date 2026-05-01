import { Action, ActionPanel, Color, Icon, List } from "@raycast/api";
import { useState } from "react";
import { ErrorDetail } from "../components/ErrorDetail";
import { ErrorGroupDetail, getStatusColor } from "./ErrorReportingDetail";
import { useErrorReporting } from "./useErrorReporting";

type Props = {
  projectId: string;
};

export const ErrorReportingErrorList = ({ projectId }: Props) => {
  const { errorGroups, isLoading, error } = useErrorReporting(projectId);
  const [showDetail, setShowDetail] = useState(false);

  if (error) {
    return <ErrorDetail error={error} />;
  }

  return (
    <List isLoading={isLoading} searchBarPlaceholder="Search errors..." isShowingDetail={showDetail}>
      {errorGroups?.map((group) => {
        // Extract the first line of the error message for the title
        const firstLine = group.representative.message.split("\n")[0];
        const status = group.group.resolutionStatus || "OPEN";
        const statusColor = getStatusColor(status);

        // Last seen time formatted locally + count
        const lastSeen = new Date(group.lastSeenTime).toLocaleString();

        const accessories = showDetail
          ? []
          : [
              { text: lastSeen },
              { tag: { value: status }, color: statusColor, tooltip: "Resolution Status" },
              {
                tag: { value: `${group.count}`, color: Color.SecondaryText },
                icon: Icon.Heartbeat,
                tooltip: "Occurrences",
              },
              {
                tag: { value: `${group.numAffectedServices} svc`, color: Color.SecondaryText },
                icon: Icon.Globe,
                tooltip: "Affected Services",
              },
            ];

        return (
          <List.Item
            key={group.group.groupId}
            id={group.group.groupId}
            title={firstLine}
            icon={{ source: Icon.ExclamationMark, tintColor: statusColor }}
            accessories={accessories}
            detail={<ErrorGroupDetail group={group} />}
            actions={
              <ActionPanel>
                <Action
                  title={showDetail ? "Hide Detail" : "Show Detail"}
                  icon={showDetail ? Icon.EyeDisabled : Icon.Eye}
                  onAction={() => setShowDetail(!showDetail)}
                />
                <Action.OpenInBrowser url={group.url} />
                <Action.CopyToClipboard title="Copy Error Message" content={group.representative.message} />
                <Action.CopyToClipboard title="Copy Group ID" content={group.group.groupId} />
              </ActionPanel>
            }
          />
        );
      })}
    </List>
  );
};

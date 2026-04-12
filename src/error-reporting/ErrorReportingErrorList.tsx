import { Action, ActionPanel, Color, Icon, List } from "@raycast/api";
import { useState } from "react";
import { ErrorDetail } from "../components/ErrorDetail";
import { useErrorReporting } from "./useErrorReporting";
import { ErrorGroupStats } from "./types";

type Props = {
  projectId: string;
};

const getStatusColor = (status?: string) => {
  switch (status) {
    case "OPEN":
      return Color.Red;
    case "ACKNOWLEDGED":
      return Color.Orange;
    case "RESOLVED":
      return Color.Green;
    case "MUTED":
      return Color.SecondaryText;
    default:
      return Color.Red; // Default to OPEN color
  }
};

const ErrorGroupDetail = ({ group }: { group: ErrorGroupStats }) => {
  const firstSeen = new Date(group.firstSeenTime).toLocaleString();
  const lastSeen = new Date(group.lastSeenTime).toLocaleString();
  const eventTime = group.representative.eventTime ? new Date(group.representative.eventTime).toLocaleString() : undefined;
  const status = group.group.resolutionStatus || "OPEN";

  return (
    <List.Item.Detail
      markdown={`### Error Message\n\`\`\`\n${group.representative.message}\n\`\`\``}
      metadata={
        <List.Item.Detail.Metadata>
          <List.Item.Detail.Metadata.TagList title="Status">
            <List.Item.Detail.Metadata.TagList.Item text={status} color={getStatusColor(status)} />
          </List.Item.Detail.Metadata.TagList>
          
          <List.Item.Detail.Metadata.Separator />
          
          <List.Item.Detail.Metadata.Label title="Occurrences" text={group.count} icon={Icon.Heartbeat} />
          <List.Item.Detail.Metadata.Label
            title="Affected Users"
            text={group.affectedUsersCount || "0"}
            icon={Icon.Person}
          />
          <List.Item.Detail.Metadata.Label
            title="Affected Services"
            text={String(group.numAffectedServices)}
            icon={Icon.Globe}
          />
          
          <List.Item.Detail.Metadata.Separator />
          
          <List.Item.Detail.Metadata.Label title="First Seen" text={firstSeen} icon={Icon.Calendar} />
          <List.Item.Detail.Metadata.Label title="Last Seen" text={lastSeen} icon={Icon.Clock} />
          {eventTime && (
            <List.Item.Detail.Metadata.Label title="Representative Event" text={eventTime} icon={Icon.Bug} />
          )}

          {group.representative.serviceContext && (
            <>
              <List.Item.Detail.Metadata.Separator />
              <List.Item.Detail.Metadata.Label title="Service" text={group.representative.serviceContext.service} />
              {group.representative.serviceContext.version && (
                <List.Item.Detail.Metadata.Label title="Version" text={group.representative.serviceContext.version} />
              )}
            </>
          )}

          {group.representative.context?.reportLocation && (
            <>
              <List.Item.Detail.Metadata.Separator />
              <List.Item.Detail.Metadata.Label title="File" text={group.representative.context.reportLocation.filePath} />
              <List.Item.Detail.Metadata.Label title="Line" text={String(group.representative.context.reportLocation.lineNumber)} />
              {group.representative.context.reportLocation.functionName && (
                <List.Item.Detail.Metadata.Label title="Function" text={group.representative.context.reportLocation.functionName} />
              )}
            </>
          )}

          {group.representative.context?.httpRequest && (
            <>
              <List.Item.Detail.Metadata.Separator />
              <List.Item.Detail.Metadata.Label 
                title="HTTP Request" 
                text={`${group.representative.context.httpRequest.method} ${group.representative.context.httpRequest.responseStatusCode}`} 
              />
              <List.Item.Detail.Metadata.Label title="URL" text={group.representative.context.httpRequest.url} />
              {group.representative.context.httpRequest.userAgent && (
                <List.Item.Detail.Metadata.Label title="User Agent" text={group.representative.context.httpRequest.userAgent} />
              )}
            </>
          )}

          {group.representative.context?.user && (
            <List.Item.Detail.Metadata.Label title="User" text={group.representative.context.user} icon={Icon.Person} />
          )}

          <List.Item.Detail.Metadata.Separator />
          <List.Item.Detail.Metadata.Label title="Group ID" text={group.group.groupId} />

          {group.group.trackingIssues && group.group.trackingIssues.length > 0 && (
            <>
              <List.Item.Detail.Metadata.Separator />
              {group.group.trackingIssues.map((issue, idx) => (
                <List.Item.Detail.Metadata.Link key={`issue-${idx}`} title="Tracking Issue" text={issue.url} target={issue.url} />
              ))}
            </>
          )}
          
          {group.affectedServices.length > 0 && (
            <>
              <List.Item.Detail.Metadata.Separator />
              <List.Item.Detail.Metadata.Label title="Affected Services List" icon={Icon.List} />
              {group.affectedServices.map((svc, idx) => (
                <List.Item.Detail.Metadata.Label
                  key={`${svc.service}-${idx}`}
                  title={`  ${svc.service}`}
                  text={svc.version || "—"}
                />
              ))}
            </>
          )}
          {group.timedCounts.length > 0 && (
            <>
              <List.Item.Detail.Metadata.Separator />
              <List.Item.Detail.Metadata.Label title="Daily Counts (Last 7 Days)" icon={Icon.BarChart} />
              {group.timedCounts.slice(0, 7).map((tc, idx) => {
                const start = new Date(tc.startTime).toLocaleDateString();
                return (
                  <List.Item.Detail.Metadata.Label key={`tc-${idx}`} title={`  ${start}`} text={`${tc.count}`} />
                );
              })}
            </>
          )}
          <List.Item.Detail.Metadata.Separator />
          <List.Item.Detail.Metadata.Link title="Open in Console" text="View Error Group" target={group.url} />
        </List.Item.Detail.Metadata>
      }
    />
  );
};

export const ErrorReportingErrorList = ({ projectId }: Props) => {
  const { errorGroups, isLoading, error } = useErrorReporting(projectId);
  const [showDetail, setShowDetail] = useState(false);

  if (error) {
    return <ErrorDetail error={error} />;
  }

  return (
    <List
      isLoading={isLoading}
      searchBarPlaceholder="Search errors..."
      isShowingDetail={showDetail}
    >
      {errorGroups?.map((group) => {
        // Extract the first line of the error message for the title
        const firstLine = group.representative.message.split("\n")[0];
        const status = group.group.resolutionStatus || "OPEN";
        const statusColor = getStatusColor(status);

        // Last seen time formatted locally + count
        const lastSeen = new Date(group.lastSeenTime).toLocaleString();
        const subtitle = showDetail ? undefined : `${lastSeen}`;

        const accessories = showDetail
          ? []
          : [
              { tag: { value: status }, color: statusColor, tooltip: "Resolution Status" },
              { tag: { value: `${group.count}`, color: Color.SecondaryText }, icon: Icon.Heartbeat, tooltip: "Occurrences" },
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
            subtitle={subtitle}
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


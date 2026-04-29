import { Color, Icon, List } from "@raycast/api";
import { ErrorGroupStats, ResolutionStatus } from "./types";

export const getStatusColor = (status?: ResolutionStatus) => {
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

type Props = {
  group: ErrorGroupStats;
};

const MAX_STACKTRACE_LINES = 12;
const MAX_STACKTRACE_CHARS = 1600;
const MAX_AFFECTED_SERVICES = 3;
const MAX_DAILY_COUNTS = 3;

const truncateStacktrace = (message: string) => {
  const lines = message.split("\n");
  const truncatedByLineCount = lines.length > MAX_STACKTRACE_LINES;
  const lineLimitedMessage = truncatedByLineCount ? lines.slice(0, MAX_STACKTRACE_LINES).join("\n") : message;
  const truncatedByCharCount = lineLimitedMessage.length > MAX_STACKTRACE_CHARS;
  const limitedMessage = truncatedByCharCount
    ? `${lineLimitedMessage.slice(0, MAX_STACKTRACE_CHARS).trimEnd()}\n\n... (truncated)`
    : lineLimitedMessage;

  return truncatedByLineCount && !truncatedByCharCount ? `${limitedMessage}\n\n... (truncated)` : limitedMessage;
};

export const ErrorGroupDetail = ({ group }: Props) => {
  const firstSeen = new Date(group.firstSeenTime).toLocaleString();
  const lastSeen = new Date(group.lastSeenTime).toLocaleString();
  const eventTime = group.representative.eventTime
    ? new Date(group.representative.eventTime).toLocaleString()
    : undefined;
  const status = group.group.resolutionStatus || "OPEN";
  const stacktrace = truncateStacktrace(group.representative.message);
  const displayedAffectedServices = group.affectedServices.slice(0, MAX_AFFECTED_SERVICES);
  const hiddenAffectedServicesCount = group.affectedServices.length - displayedAffectedServices.length;
  const displayedTimedCounts = group.timedCounts.slice(0, MAX_DAILY_COUNTS);
  const hiddenTimedCountsCount = group.timedCounts.length - displayedTimedCounts.length;

  return (
    <List.Item.Detail
      markdown={`### ${status}\n\`\`\`\n${stacktrace}\n\`\`\``}
      metadata={
        <List.Item.Detail.Metadata>
          <List.Item.Detail.Metadata.Label title="Last Seen" text={lastSeen} icon={Icon.Clock} />
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
              <List.Item.Detail.Metadata.Label
                title="File"
                text={group.representative.context.reportLocation.filePath}
              />
              <List.Item.Detail.Metadata.Label
                title="Line"
                text={String(group.representative.context.reportLocation.lineNumber)}
              />
              {group.representative.context.reportLocation.functionName && (
                <List.Item.Detail.Metadata.Label
                  title="Function"
                  text={group.representative.context.reportLocation.functionName}
                />
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
                <List.Item.Detail.Metadata.Label
                  title="User Agent"
                  text={group.representative.context.httpRequest.userAgent}
                />
              )}
            </>
          )}

          {group.representative.context?.user && (
            <List.Item.Detail.Metadata.Label title="User" text={group.representative.context.user} icon={Icon.Person} />
          )}

          {group.group.trackingIssues && group.group.trackingIssues.length > 0 && (
            <>
              <List.Item.Detail.Metadata.Separator />
              {group.group.trackingIssues.map((issue, idx) => (
                <List.Item.Detail.Metadata.Link
                  key={`issue-${idx}`}
                  title="Tracking Issue"
                  text={issue.url}
                  target={issue.url}
                />
              ))}
            </>
          )}

          {group.affectedServices.length > 0 && (
            <>
              <List.Item.Detail.Metadata.Separator />
              <List.Item.Detail.Metadata.Label title="Affected Services List" icon={Icon.List} />
              {displayedAffectedServices.map((svc, idx) => (
                <List.Item.Detail.Metadata.Label
                  key={`${svc.service}-${idx}`}
                  title={`  ${svc.service}`}
                  text={svc.version || "—"}
                />
              ))}
              {hiddenAffectedServicesCount > 0 && (
                <List.Item.Detail.Metadata.Label
                  title="  More"
                  text={`${hiddenAffectedServicesCount} additional services`}
                />
              )}
            </>
          )}
          {group.timedCounts.length > 0 && (
            <>
              <List.Item.Detail.Metadata.Separator />
              <List.Item.Detail.Metadata.Label title="Daily Counts" icon={Icon.BarChart} />
              {displayedTimedCounts.map((tc, idx) => {
                const start = new Date(tc.startTime).toLocaleDateString();
                return <List.Item.Detail.Metadata.Label key={`tc-${idx}`} title={`  ${start}`} text={`${tc.count}`} />;
              })}
              {hiddenTimedCountsCount > 0 && (
                <List.Item.Detail.Metadata.Label title="  More" text={`${hiddenTimedCountsCount} older days`} />
              )}
            </>
          )}
        </List.Item.Detail.Metadata>
      }
    />
  );
};

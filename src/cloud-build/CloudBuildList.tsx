import { Action, ActionPanel, Color, Icon, List } from "@raycast/api";
import { useCloudBuilds } from "./useCloudBuilds";
import { ErrorDetail } from "../components/ErrorDetail";
import { CloudBuildStatus } from "./types";

type Props = {
  projectId: string;
};

const statusIcon = (status: CloudBuildStatus): { source: Icon; tintColor: Color } => {
  switch (status) {
    case "SUCCESS":
      return { source: Icon.CheckCircle, tintColor: Color.Green };
    case "FAILURE":
    case "INTERNAL_ERROR":
      return { source: Icon.XMarkCircle, tintColor: Color.Red };
    case "WORKING":
      return { source: Icon.CircleProgress50, tintColor: Color.Blue };
    case "QUEUED":
    case "PENDING":
      return { source: Icon.Clock, tintColor: Color.Yellow };
    case "CANCELLED":
      return { source: Icon.MinusCircle, tintColor: Color.SecondaryText };
    case "TIMEOUT":
    case "EXPIRED":
      return { source: Icon.Warning, tintColor: Color.Orange };
    default:
      return { source: Icon.QuestionMarkCircle, tintColor: Color.SecondaryText };
  }
};

export const CloudBuildList = ({ projectId }: Props) => {
  const { builds, isLoading, error } = useCloudBuilds(projectId);

  if (error) {
    return <ErrorDetail error={error} />;
  }

  return (
    <List isLoading={isLoading} searchBarPlaceholder="Search builds...">
      {builds?.map((build) => {
        const createdAt = new Date(build.createTime).toLocaleString();
        const title = build.triggerName ?? build.id;
        const subtitle = `${build.status} • ${createdAt}`;

        return (
          <List.Item
            key={build.id}
            id={build.id}
            icon={statusIcon(build.status)}
            title={title}
            subtitle={subtitle}
            keywords={build.keywords}
            actions={
              <ActionPanel>
                <Action.OpenInBrowser url={build.url} />
                <Action.CopyToClipboard title="Copy Build ID" content={build.id} />
              </ActionPanel>
            }
          />
        );
      })}
    </List>
  );
};

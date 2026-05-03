import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { useCloudRunDeployments } from "./useCloudRunDeployments";
import { ErrorDetail } from "../components/ErrorDetail";

type Props = {
  projectId: string;
};

export const CloudRunServicesList = (props: Props) => {
  const { deployments, isLoading, error } = useCloudRunDeployments(props.projectId);

  if (error) {
    return <ErrorDetail error={error} />;
  }

  return (
    <List isLoading={isLoading}>
      {deployments?.map((deployment) => {
        return (
          <List.Item
            key={deployment.id}
            id={deployment.id}
            icon={Icon.Box}
            title={deployment.name}
            keywords={deployment.keywords}
            accessories={[{ text: deployment.deployType }, { text: deployment.region }]}
            actions={
              <ActionPanel>
                <Action.OpenInBrowser url={deployment.url} />
                {deployment.uri && <Action.CopyToClipboard title="Copy Primary URL" content={deployment.uri} />}
                {(deployment.deployType === "Container Services" || deployment.deployType === "Function Services") && (
                  <Action.OpenInBrowser
                    title="Open Revisions in Browser"
                    url={`https://console.cloud.google.com/run/detail/${deployment.region}/${deployment.name}/revisions?project=${props.projectId}`}
                    icon={Icon.ChevronRight}
                  />
                )}
                {deployment.deployType === "Jobs" && (
                  <Action.OpenInBrowser
                    title="Open Executions in Browser"
                    url={`https://console.cloud.google.com/run/jobs/details/${deployment.region}/${deployment.name}/executions?project=${props.projectId}`}
                    icon={Icon.ChevronRight}
                  />
                )}
              </ActionPanel>
            }
          />
        );
      })}
    </List>
  );
};

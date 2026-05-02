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
              </ActionPanel>
            }
          />
        );
      })}
    </List>
  );
};

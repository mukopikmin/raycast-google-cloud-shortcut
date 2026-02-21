import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { useCloudRunServices } from "./useCloudRunServices";
import { useCloudRunDeployments } from "./useCloudRunDeployments";

type Props = {
  projectId: string;
};

export const CloudRunServicesList = (props: Props) => {
  const { deployments, isLoading } = useCloudRunDeployments(props.projectId);

  return (
    <List isLoading={isLoading}>
      {deployments?.map((deployment) => {
        return (
          <List.Item
            key={deployment.id}
            id={deployment.id}
            icon={Icon.Box}
            title={deployment.name}
            subtitle={`${deployment.deployType} / ${deployment.region}`}
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

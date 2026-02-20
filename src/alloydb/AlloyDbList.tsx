import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { useAlloyDbClusters } from "./useAlloyDbClusters";

type Props = {
  projectId: string;
};

export const AlloyDbClusterList = (props: Props) => {
  const { clusters, isLoading } = useAlloyDbClusters(props.projectId);

  return (
    <List isLoading={isLoading}>
      {clusters?.map((cluster) => (
        <List.Item
          key={cluster.id}
          id={cluster.id}
          icon={Icon.Box}
          title={cluster.name}
          subtitle={`${cluster.region} ${cluster.state}`}
          actions={
            <ActionPanel>
              <Action.OpenInBrowser url={cluster.url} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
};

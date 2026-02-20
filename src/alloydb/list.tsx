import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { useAlloyDb } from "./use-alloydb";

type Props = {
  projectId: string;
};

export const SqlList = (props: Props) => {
  const { clusters, isLoading } = useAlloyDb(props.projectId);

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

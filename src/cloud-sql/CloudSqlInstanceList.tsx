import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { useCloudSqlInstances } from "./useCloudSqlInstances";

type Props = {
  projectId: string;
};

export const CloudSqlInstanceList = (props: Props) => {
  const { cloudSqlInstances, isLoading } = useCloudSqlInstances(props.projectId);

  return (
    <List isLoading={isLoading}>
      {cloudSqlInstances?.map((instance) => (
        <List.Item
          key={instance.id}
          id={instance.id}
          icon={Icon.Box}
          title={instance.id}
          subtitle={`${instance.region} ${instance.state}`}
          actions={
            <ActionPanel>
              <Action.OpenInBrowser url={instance.url} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
};

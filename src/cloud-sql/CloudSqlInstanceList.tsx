import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { useCloudSqlInstances } from "./useCloudSqlInstances";
import { ErrorDetail } from "../components/ErrorDetail";

type Props = {
  projectId: string;
};

export const CloudSqlInstanceList = (props: Props) => {
  const { cloudSqlInstances, isLoading, error } = useCloudSqlInstances(props.projectId);

  if (error) {
    return <ErrorDetail error={error} />;
  }

  return (
    <List isLoading={isLoading}>
      {cloudSqlInstances?.map((instance) => (
        <List.Item
          key={instance.id}
          id={instance.id}
          icon={Icon.Box}
          title={instance.id}
          accessories={[{ text: instance.region }, { text: instance.state }]}
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

import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { useCloudTasks } from "./useCloudTasks";
import { ErrorDetail } from "../components/ErrorDetail";

type Props = {
  projectId: string;
  locationId: string;
};

export const CloudTasksQueueList = (props: Props) => {
  const { queues, isLoading, error } = useCloudTasks(props.projectId, props.locationId);

  if (error) {
    return <ErrorDetail error={error} />;
  }

  return (
    <List isLoading={isLoading}>
      {queues?.map((queue) => (
        <List.Item
          key={queue.name}
          id={queue.name}
          title={queue.name}
          icon={Icon.Box}
          accessories={[{ text: queue.region }]}
          actions={
            <ActionPanel>
              <Action.OpenInBrowser url={queue.url} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
};

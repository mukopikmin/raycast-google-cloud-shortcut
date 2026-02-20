import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { useCloudTasks } from "./useCloudTasks";

type Props = {
  projectId: string;
  locationId: string;
};

export const CloudTasksQueueList = (props: Props) => {
  const { queues, isLoading } = useCloudTasks(props.projectId, props.locationId);

  return (
    <List isLoading={isLoading}>
      {queues?.map((queue) => (
        <List.Item
          key={queue.name}
          id={queue.name}
          title={queue.name}
          subtitle={queue.region}
          icon={Icon.Box}
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

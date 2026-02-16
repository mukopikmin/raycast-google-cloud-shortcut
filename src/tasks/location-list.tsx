import { Action, ActionPanel, List } from "@raycast/api";
import { useTasksLocations } from "./use-tasks-location";
import { TasksQueueList } from "./list";

type Props = {
  projectId: string;
};

export const TasksLocationList = (props: Props) => {
  const { locations, isLoading } = useTasksLocations(props.projectId);
  console.log(locations);
  return (
    <List isLoading={isLoading}>
      {locations?.map((location) => (
        <List.Item
          key={location.id}
          id={location.id}
          title={location.id}
          subtitle={location.id}
          actions={
            <ActionPanel>
              <Action.Push
                title={`Show ${location.id} Resources`}
                target={<TasksQueueList projectId={props.projectId} locationId={location.id} />}
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
};

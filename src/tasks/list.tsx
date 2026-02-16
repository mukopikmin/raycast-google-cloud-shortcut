import { List } from "@raycast/api";
import { useTasks } from "./use-tasks";

type Props = {
  projectId: string;
};

export const TasksQueueList = (props: Props) => {
  const { queues, isLoading } = useTasks(props.projectId);

  return (
    <List isLoading={isLoading}>
      {queues?.map((queue) => (
        <List.Item key={queue.name} id={queue.name} title={queue.name} subtitle={queue.region} />
      ))}
    </List>
  );
};

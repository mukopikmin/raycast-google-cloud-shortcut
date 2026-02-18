import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { TasksQueueList } from "./list";
import { regions } from "../service/region";

type Props = {
  projectId: string;
};

export const TasksLocationList = (props: Props) => {
  return (
    <List>
      {regions?.map((region) => (
        <List.Item
          key={region.id}
          id={region.id}
          title={region.name}
          subtitle={region.id}
          icon={Icon.Map}
          actions={
            <ActionPanel>
              <Action.Push
                title={`Show Resources in ${region.id}`}
                target={<TasksQueueList projectId={props.projectId} locationId={region.id} />}
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
};

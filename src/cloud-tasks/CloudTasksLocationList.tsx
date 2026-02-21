import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { CloudTasksQueueList } from "./CloudTasksQueueList";
import { useRegion } from "../region/useRegion";

type Props = {
  projectId: string;
};

export const CloudTasksLocationList = (props: Props) => {
  const { regions } = useRegion();

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
                target={<CloudTasksQueueList projectId={props.projectId} locationId={region.id} />}
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
};

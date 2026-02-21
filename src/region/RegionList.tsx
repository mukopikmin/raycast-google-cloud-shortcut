import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { useRegion } from "./useRegion";

type Props = {
  projectId: string;
  target: (args: { projectId: string; locationId: string }) => React.ReactNode;
};

export const RegionList = (props: Props) => {
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
                target={props.target({ projectId: props.projectId, locationId: region.id })}
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
};

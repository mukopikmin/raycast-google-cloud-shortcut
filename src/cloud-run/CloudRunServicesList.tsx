import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { useCloudRunServices } from "./useCloudRunServices";

type Props = {
  projectId: string;
};

export const CloudRunServicesList = (props: Props) => {
  const { services, isLoading } = useCloudRunServices(props.projectId);

  return (
    <List isLoading={isLoading}>
      {services?.map((service) => {
        return (
          <List.Item
            key={service.id}
            id={service.id}
            icon={Icon.Box}
            title={service.name}
            subtitle={`${service.deployType} / ${service.region}`}
            actions={
              <ActionPanel>
                <Action.OpenInBrowser url={service.url} />
              </ActionPanel>
            }
          />
        );
      })}
    </List>
  );
};

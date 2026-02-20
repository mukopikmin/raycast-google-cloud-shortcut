import { ActionPanel, Action, Icon, List } from "@raycast/api";
import { useServiceResource } from "./use-service-resource";

type Props = {
  projectId: string;
};

export const ServiceList = (props: Props) => {
  const { services } = useServiceResource(props.projectId);

  return (
    <List>
      {services.map((service) => (
        <List.Item
          key={service.url}
          icon={Icon.ComputerChip}
          title={service.name}
          subtitle={service.category}
          accessories={service.isSearchEnabled ? [{ icon: Icon.MagnifyingGlass, tooltip: "Show Resources" }] : []}
          actions={
            <ActionPanel>
              {service.isSearchEnabled && service.searchAction}
              <Action.OpenInBrowser url={`${service.url}?project=${props.projectId}`} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
};

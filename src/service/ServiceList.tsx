import { ActionPanel, Action, Icon, List } from "@raycast/api";
import { useServiceResource } from "./useServiceResource";

type Props = {
  projectId: string;
};

export const ServiceList = (props: Props) => {
  const { services } = useServiceResource(props.projectId);
  const searchAccessory = [{ icon: Icon.MagnifyingGlass, tooltip: "Show Resources" }];

  return (
    <List>
      {services.map((service) => (
        <List.Item
          key={service.name}
          title={service.name}
          subtitle={service.category}
          keywords={service.keywords}
          icon={Icon.ComputerChip}
          accessories={service.isSearchEnabled ? searchAccessory : []}
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

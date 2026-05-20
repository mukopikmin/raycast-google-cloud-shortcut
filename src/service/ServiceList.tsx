import { ActionPanel, Action, Icon, List } from "@raycast/api";
import { useServiceResource } from "./useServiceResource";

type Props = {
  projectId: string;
};

export const ServiceList = (props: Props) => {
  const { services } = useServiceResource(props.projectId);

  return (
    <List>
      {services.map((service) => (
        <List.Item
          key={service.name}
          title={service.name}
          keywords={service.keywords}
          icon={Icon.ComputerChip}
          accessories={[
            { text: service.category },
            service.isSearchEnabled
              ? { icon: Icon.MagnifyingGlass, tooltip: "Show Resources" }
              : { icon: Icon.ArrowNe, tooltip: "Open in Browser" },
          ].filter((a) => a.text || a.icon)}
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

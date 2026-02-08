import { ActionPanel, Action, Icon, List } from "@raycast/api";
import { services } from "./services";

export function ServiceList(props: { projectId: string }) {
  return (
    <List>
      {services.map((service) => (
        <List.Item
          key={service.url}
          icon={Icon.Bird}
          title={service.name}
          subtitle={service.category}
          actions={
            <ActionPanel>
              <Action.OpenInBrowser url={`${service.url}?project=${props.projectId}`} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}

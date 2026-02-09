import { ActionPanel, Action, Icon, List } from "@raycast/api";
import { Service, services } from "./service";
import { RunList } from "../run/run-list";

type Props = {
  projectId: string;
};

export const ServiceList = (props: Props) => {
  return (
    <List>
      {services.map((service) => (
        <List.Item
          key={service.url}
          icon={Icon.ComputerChip}
          title={service.name}
          subtitle={service.category}
          actions={
            <ActionPanel>
              <Action.OpenInBrowser url={`${service.url}?project=${props.projectId}`} />
              {detectServiceAction(service, props.projectId)}
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
};

export const detectServiceAction = (service: Service, projectId: string) => {
  switch (service.name) {
    case "Cloud Run":
      return <Action.Push title="Show Cloud Run Resources" target={<RunList projectId={projectId} />} />;

    default:
      return <></>;
  }
};

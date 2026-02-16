import { ActionPanel, Action, Icon, List } from "@raycast/api";
import { Service, services } from "./service";
import { RunList } from "../run/run-list";
import { SqlList } from "../sql/list";

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
              <ServiceDetailAction service={service} projectId={props.projectId} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
};

type DetectServiceActionProps = {
  service: Service;
  projectId: string;
};

export const ServiceDetailAction = (props: DetectServiceActionProps) => {
  const { service, projectId } = props;

  switch (service.name) {
    case "Cloud Run":
      return <Action.Push title={`Show ${service.name} Resources`} target={<RunList projectId={projectId} />} />;
    case "Cloud SQL":
      return <Action.Push title={`Show ${service.name} Resources`} target={<SqlList projectId={projectId} />} />;

    default:
      return <></>;
  }
};

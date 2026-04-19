import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { useAppEngineServices } from "./useAppEngineServices";
import { ErrorDetail } from "../components/ErrorDetail";

type Props = {
  projectId: string;
};

export const AppEngineServiceList = (props: Props) => {
  const { services, isLoading, error } = useAppEngineServices(props.projectId);

  if (error) {
    return <ErrorDetail error={error} />;
  }

  return (
    <List isLoading={isLoading}>
      {services?.map((service) => {
        return (
          <List.Item
            key={service.id}
            id={service.id}
            icon={Icon.Box}
            title={service.name}
            keywords={service.keywords}
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

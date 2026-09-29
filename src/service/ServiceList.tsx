import { ActionPanel, Action, Icon, List } from "@raycast/api";
import { useState } from "react";
import { launchAuthenticatedCommand } from "../auth/launch";
import { ErrorDetail } from "../components/ErrorDetail";
import { useServiceResource } from "./useServiceResource";

type Props = {
  projectId: string;
};

export const ServiceList = (props: Props) => {
  const { services } = useServiceResource(props.projectId);
  const [error, setError] = useState<Error>();

  if (error) return <ErrorDetail error={error} />;

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
              {service.isSearchEnabled && (
                <Action
                  title={`Show ${service.name} Resources`}
                  onAction={async () => {
                    try {
                      await launchAuthenticatedCommand({
                        type: "resources",
                        projectId: props.projectId,
                        serviceName: service.name,
                      });
                    } catch (error) {
                      setError(error instanceof Error ? error : new Error(String(error)));
                    }
                  }}
                />
              )}
              <Action.OpenInBrowser url={`${service.url}?project=${props.projectId}`} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
};

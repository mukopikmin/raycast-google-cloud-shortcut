import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { useComputeEngineInstances } from "./useComputeEngineInstances";
import { ErrorDetail } from "../components/ErrorDetail";

type Props = {
  projectId: string;
};

export const ComputeEngineInstanceList = (props: Props) => {
  const { instances, isLoading, error } = useComputeEngineInstances(props.projectId);

  if (error) {
    return <ErrorDetail error={error} />;
  }

  return (
    <List isLoading={isLoading}>
      {instances?.map((instance) => {
        const ips = [instance.internalIp, instance.externalIp].filter(Boolean).join(" / ");
        return (
          <List.Item
            key={instance.id}
            id={instance.id}
            icon={Icon.ComputerChip}
            title={instance.name}
            subtitle={ips}
            accessories={[{ text: instance.zone }, { text: instance.machineType }, { text: instance.status }].filter(
              (a) => a.text,
            )}
            actions={
              <ActionPanel>
                <Action.OpenInBrowser url={instance.url} />
                <Action.CopyToClipboard title="Copy Instance ID" content={instance.id} />
                {instance.internalIp && (
                  <Action.CopyToClipboard title="Copy Internal IP" content={instance.internalIp} />
                )}
                {instance.externalIp && (
                  <Action.CopyToClipboard title="Copy External IP" content={instance.externalIp} />
                )}
              </ActionPanel>
            }
          />
        );
      })}
    </List>
  );
};

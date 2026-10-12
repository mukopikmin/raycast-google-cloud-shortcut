import { PaginatedResourceList } from "../../components/PaginatedResourceList";
import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { useComputeEngineInstances } from "./useComputeEngineInstances";
import { ErrorDetail } from "../../components/ErrorDetail";
import { withGoogleAccessToken } from "../../auth/google";
import { OpenCloudLoggingAction } from "../../actions/cloud-logging/OpenCloudLoggingAction";

type Props = {
  projectId: string;
};

const ComputeEngineInstanceListComponent = (props: Props) => {
  const { instances, error, ...pagination } = useComputeEngineInstances(props.projectId);

  if (error) {
    return <ErrorDetail error={error} />;
  }

  return (
    <PaginatedResourceList {...pagination} resourceName="Compute Engine Instances" loadedCount={instances.length}>
      {(loadMoreAction) =>
        instances.map((instance) => {
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
                  <OpenCloudLoggingAction target={instance} />
                  <Action.CopyToClipboard title="Copy Instance ID" content={instance.id} />
                  {instance.internalIp && (
                    <Action.CopyToClipboard title="Copy Internal IP" content={instance.internalIp} />
                  )}
                  {instance.externalIp && (
                    <Action.CopyToClipboard title="Copy External IP" content={instance.externalIp} />
                  )}
                  {loadMoreAction}
                </ActionPanel>
              }
            />
          );
        })
      }
    </PaginatedResourceList>
  );
};

export const ComputeEngineInstanceList = withGoogleAccessToken(ComputeEngineInstanceListComponent);

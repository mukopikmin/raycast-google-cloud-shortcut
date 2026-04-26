import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { useVpcNetworks } from "./useVpcNetworks";
import { ErrorDetail } from "../components/ErrorDetail";

type Props = {
  projectId: string;
};

export const VpcNetworkList = (props: Props) => {
  const { networks, isLoading, error } = useVpcNetworks(props.projectId);

  if (error) {
    return <ErrorDetail error={error} />;
  }

  return (
    <List isLoading={isLoading}>
      {networks?.map((network) => (
        <List.Item
          key={network.id}
          id={network.id}
          icon={Icon.Globe}
          title={network.name}
          subtitle={`Subnet mode: ${network.subnetworkMode}`}
          keywords={network.keywords}
          actions={
            <ActionPanel>
              <Action.OpenInBrowser url={network.url} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
};

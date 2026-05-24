import { ActionPanel, Action, Icon, List } from "@raycast/api";
import { useLoadBalancers } from "./useLoadBalancers";
import { ErrorDetail } from "../components/ErrorDetail";

type Props = {
  projectId: string;
};

export const LoadBalancerList = ({ projectId }: Props) => {
  const { resources, isLoading, error } = useLoadBalancers(projectId);

  if (error) {
    return <ErrorDetail error={error} />;
  }

  return (
    <List isLoading={isLoading} searchBarPlaceholder="Search load balancers and global addresses...">
      {resources?.map((resource) => (
        <List.Item
          key={resource.id}
          title={resource.name}
          subtitle={resource.type === "forwardingRule" ? resource.IPAddress : resource.address}
          icon={Icon.Box}
          accessories={
            resource.type === "forwardingRule"
              ? [
                  { text: resource.region },
                  { text: resource.IPProtocol },
                  { text: resource.loadBalancingScheme },
                ].filter((a) => a.text)
              : [{ text: "Global Address" }]
          }
          actions={
            <ActionPanel>
              <Action.OpenInBrowser url={resource.url} />
              <Action.CopyToClipboard
                title="Copy IP Address"
                content={resource.type === "forwardingRule" ? resource.IPAddress : resource.address}
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
};

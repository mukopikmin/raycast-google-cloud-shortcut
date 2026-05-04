import { ActionPanel, Action, Icon, List } from "@raycast/api";
import { useForwardingRules } from "./useForwardingRules";
import { ErrorDetail } from "../components/ErrorDetail";

type Props = {
  projectId: string;
};

export const LoadBalancerList = ({ projectId }: Props) => {
  const { forwardingRules, isLoading, error } = useForwardingRules(projectId);

  if (error) {
    return <ErrorDetail error={error} />;
  }

  return (
    <List isLoading={isLoading} searchBarPlaceholder="Search load balancers...">
      {forwardingRules?.map((rule) => (
        <List.Item
          key={rule.id}
          title={rule.name}
          subtitle={rule.IPAddress}
          icon={Icon.Network}
          accessories={[{ text: rule.region }, { text: rule.IPProtocol }, { text: rule.loadBalancingScheme }].filter(
            (a) => a.text,
          )}
          actions={
            <ActionPanel>
              <Action.OpenInBrowser url={rule.url} />
              <Action.CopyToClipboard title="Copy IP Address" content={rule.IPAddress} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
};

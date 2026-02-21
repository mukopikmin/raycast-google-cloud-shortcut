import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { usePubSubSubscriptions } from "./usePubSubSubscriptions";

type Props = {
  projectId: string;
};

export const PubSubSubscriptionList = (props: Props) => {
  const { subscriptions, isLoading } = usePubSubSubscriptions(props.projectId);

  return (
    <List isLoading={isLoading}>
      {subscriptions?.map((subscription) => (
        <List.Item
          key={subscription.name}
          id={subscription.name}
          title={subscription.name}
          subtitle={`Topic: ${subscription.topic}`}
          icon={Icon.Box}
          actions={
            <ActionPanel>
              <Action.OpenInBrowser url={subscription.url} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
};

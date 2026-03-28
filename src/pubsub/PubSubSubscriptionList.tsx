import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { usePubSubSubscriptions } from "./usePubSubSubscriptions";
import { ErrorDetail } from "../components/ErrorDetail";

type Props = {
  projectId: string;
};

export const PubSubSubscriptionList = (props: Props) => {
  const { subscriptions, isLoading, error } = usePubSubSubscriptions(props.projectId);

  if (error) {
    return <ErrorDetail error={error} />;
  }

  return (
    <List isLoading={isLoading}>
      {subscriptions?.map((subscription) => (
        <List.Item
          key={subscription.name}
          id={subscription.name}
          title={subscription.name}
          subtitle={`Subscribing to ${subscription.topic}`}
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

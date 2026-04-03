import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { usePubSubResources } from "./usePubSubResources";

type Props = {
  projectId: string;
};

export const PubSubSubscriptionList = (props: Props) => {
  const { resources, isLoading } = usePubSubResources(props.projectId);

  return (
    <List isLoading={isLoading}>
      {resources?.map((resource) => (
        <List.Item
          key={`${resource.resourceType}/${resource.name}`}
          id={`${resource.resourceType}/${resource.name}`}
          title={resource.name}
          subtitle={
            resource.resourceType === "Subscription"
              ? `${resource.resourceType} / ${resource.subscriptionType}`
              : resource.resourceType
          }
          icon={Icon.Box}
          keywords={resource.keywords}
          actions={
            <ActionPanel>
              <Action.OpenInBrowser url={resource.url} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
};

import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { usePubSubResources } from "./usePubSubResources";
import { ErrorDetail } from "../components/ErrorDetail";

type Props = {
  projectId: string;
};

export const PubSubSubscriptionList = (props: Props) => {
  const { resources, isLoading, isLoadingMore, hasMore, isTruncated, loadMore, error } = usePubSubResources(
    props.projectId,
  );

  if (error) {
    return <ErrorDetail error={error} />;
  }

  const canLoadMore = hasMore && !isTruncated;

  return (
    <List
      isLoading={isLoading || isLoadingMore}
      searchBarPlaceholder={
        canLoadMore
          ? "Search loaded topics/subscriptions. More resources are available via Load More."
          : "Search loaded topics/subscriptions"
      }
    >
      {resources?.map((resource) => (
        <List.Item
          key={`${resource.resourceType}/${resource.name}`}
          id={`${resource.resourceType}/${resource.name}`}
          title={resource.name}
          icon={Icon.Box}
          keywords={resource.keywords}
          accessories={[
            {
              text:
                resource.resourceType === "Subscription"
                  ? `${resource.resourceType} / ${resource.subscriptionType}`
                  : resource.resourceType,
            },
          ].filter((a) => a.text)}
          actions={
            <ActionPanel>
              <Action.OpenInBrowser url={resource.url} />
              {canLoadMore && <Action title="Load More Pub/Sub Resources" icon={Icon.ArrowDown} onAction={loadMore} />}
            </ActionPanel>
          }
        />
      ))}
      {canLoadMore && (
        <List.Item
          key="load-more-pubsub"
          title="Load More Pub/Sub Resources"
          icon={Icon.ArrowDown}
          actions={
            <ActionPanel>
              <Action title="Load More Pub/Sub Resources" icon={Icon.ArrowDown} onAction={loadMore} />
            </ActionPanel>
          }
        />
      )}
      {isTruncated && (
        <List.EmptyView
          title="Resource list truncated"
          description="The Pub/Sub resource list is truncated to keep memory usage bounded."
        />
      )}
    </List>
  );
};

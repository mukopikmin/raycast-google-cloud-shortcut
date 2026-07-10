import { useState } from "react";
import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { usePubSubResources } from "./usePubSubResources";
import { ErrorDetail } from "../../components/ErrorDetail";
import { useLoadMoreOnSearch } from "../../hooks/useLoadMoreOnSearch";
import { withGoogleAccessToken } from "../../auth/google";

type Props = {
  projectId: string;
};

const PubSubSubscriptionListComponent = (props: Props) => {
  const [searchText, setSearchText] = useState("");
  const { resources, isLoading, isLoadingMore, hasMore, isTruncated, loadMore, error } = usePubSubResources(
    props.projectId,
  );

  const canLoadMore = hasMore && !isTruncated;
  useLoadMoreOnSearch({ searchText, canLoadMore, isLoading, isLoadingMore, loadMore });

  if (error) {
    return <ErrorDetail error={error} />;
  }

  const loadMoreAction = canLoadMore ? (
    <Action title="Load More Pub/Sub Resources" icon={Icon.ArrowDown} onAction={loadMore} />
  ) : undefined;

  return (
    <List
      isLoading={isLoading || isLoadingMore}
      pagination={
        canLoadMore
          ? {
              pageSize: 50,
              hasMore: canLoadMore,
              onLoadMore: () => {
                void loadMore();
              },
            }
          : undefined
      }
      filtering
      onSearchTextChange={setSearchText}
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
              {loadMoreAction}
            </ActionPanel>
          }
        />
      ))}
      {canLoadMore && (
        <List.Item
          key="load-more-pubsub"
          title="Load More Pub/Sub Resources"
          icon={Icon.ArrowDown}
          actions={<ActionPanel>{loadMoreAction}</ActionPanel>}
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

export const PubSubSubscriptionList = withGoogleAccessToken(PubSubSubscriptionListComponent);

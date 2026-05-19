import { useState } from "react";
import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { useCloudStorage } from "./useCloudStorage";
import { ErrorDetail } from "../components/ErrorDetail";

type Props = {
  projectId: string;
};

export const CloudStorageBucketList = (props: Props) => {
  const [searchText, setSearchText] = useState("");
  const { buckets, isLoading, isLoadingMore, hasMore, isTruncated, loadMore, error } = useCloudStorage(props.projectId);

  if (error) {
    return <ErrorDetail error={error} />;
  }

  const canLoadMore = hasMore && !isTruncated;
  const loadMoreAction = canLoadMore ? (
    <Action title="Load More Buckets" icon={Icon.ArrowDown} onAction={loadMore} />
  ) : undefined;

  return (
    <List
      isLoading={isLoading || isLoadingMore}
      filtering
      onSearchTextChange={setSearchText}
      searchBarPlaceholder="Search loaded buckets..."
    >
      <List.EmptyView
        icon={Icon.MagnifyingGlass}
        title={searchText && canLoadMore ? "No loaded buckets match this search" : "No buckets found"}
        description={
          searchText && canLoadMore
            ? "More buckets may exist. Load more buckets to expand the searchable set."
            : isTruncated
              ? "The bucket list is truncated to keep memory usage bounded."
              : undefined
        }
        actions={loadMoreAction ? <ActionPanel>{loadMoreAction}</ActionPanel> : undefined}
      />
      {buckets?.map((bucket) => (
        <List.Item
          key={bucket.id}
          id={bucket.id}
          title={bucket.name}
          icon={Icon.Box}
          accessories={[{ text: bucket.location }]}
          actions={
            <ActionPanel>
              <Action.OpenInBrowser url={bucket.url} />
              {loadMoreAction}
            </ActionPanel>
          }
        />
      ))}
      {canLoadMore && (
        <List.Item
          id="load-more-cloud-storage-buckets"
          title="Load More Buckets"
          icon={Icon.ArrowDown}
          accessories={[{ text: `${buckets?.length ?? 0} loaded` }]}
          actions={<ActionPanel>{loadMoreAction}</ActionPanel>}
        />
      )}
      {isTruncated && (
        <List.Item
          id="cloud-storage-buckets-truncated"
          title="Bucket List Truncated"
          icon={Icon.ExclamationMark}
          accessories={[{ text: `${buckets?.length ?? 0} loaded` }]}
        />
      )}
    </List>
  );
};

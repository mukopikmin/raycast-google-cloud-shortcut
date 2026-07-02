import { useState } from "react";
import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { ErrorDetail } from "../components/ErrorDetail";
import { useWorkloadIdentityPools } from "./useWorkloadIdentityPools";

type Props = {
  projectId: string;
};

const formatEnum = (value: string) =>
  value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export const WorkloadIdentityPoolList = ({ projectId }: Props) => {
  const [searchText, setSearchText] = useState("");
  const { pools, isLoading, isLoadingMore, hasMore, isTruncated, loadMore, error } =
    useWorkloadIdentityPools(projectId);

  if (error) {
    return <ErrorDetail error={error} />;
  }

  const canLoadMore = hasMore && !isTruncated;
  const loadMoreAction = canLoadMore ? (
    <Action title="Load More Pools" icon={Icon.ArrowDown} onAction={loadMore} />
  ) : undefined;

  return (
    <List
      isLoading={isLoading || isLoadingMore}
      filtering
      onSearchTextChange={setSearchText}
      searchBarPlaceholder="Search loaded Workload Identity pools..."
    >
      <List.EmptyView
        icon={Icon.MagnifyingGlass}
        title={searchText && canLoadMore ? "No loaded pools match this search" : "No Workload Identity pools found"}
        description={
          searchText && canLoadMore
            ? "More pools may exist. Load more pools to expand the searchable set."
            : isTruncated
              ? "The Workload Identity pool list is truncated to keep memory usage bounded."
              : undefined
        }
        actions={loadMoreAction ? <ActionPanel>{loadMoreAction}</ActionPanel> : undefined}
      />
      {pools?.map((pool) => (
        <List.Item
          key={pool.id}
          id={pool.id}
          icon={Icon.TwoPeople}
          title={pool.name}
          subtitle={pool.name === pool.id ? undefined : pool.id}
          keywords={pool.keywords}
          accessories={[
            { text: pool.disabled ? "Disabled" : formatEnum(pool.state) },
            { text: pool.mode ? formatEnum(pool.mode) : undefined },
          ].filter((accessory) => accessory.text)}
          actions={
            <ActionPanel>
              <Action.OpenInBrowser title="Open in Google Cloud Console" url={pool.url} />
              <Action.CopyToClipboard title="Copy Pool ID" content={pool.id} />
              {loadMoreAction}
            </ActionPanel>
          }
        />
      ))}
      {canLoadMore && (
        <List.Item
          id="load-more-workload-identity-pools"
          title="Load More Pools"
          icon={Icon.ArrowDown}
          accessories={[{ text: `${pools?.length ?? 0} loaded` }]}
          actions={<ActionPanel>{loadMoreAction}</ActionPanel>}
        />
      )}
      {isTruncated && (
        <List.Item
          id="workload-identity-pools-truncated"
          title="Workload Identity Pool List Truncated"
          icon={Icon.ExclamationMark}
          accessories={[{ text: `${pools?.length ?? 0} loaded` }]}
        />
      )}
    </List>
  );
};

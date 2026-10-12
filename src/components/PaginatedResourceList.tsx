import { useState, type ReactNode } from "react";
import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { RESOURCE_LIMIT } from "../pagination/pages";
import { ResourcePagination } from "../pagination/types";

type Props = ResourcePagination & {
  resourceName: string;
  loadedCount: number;
  isShowingDetail?: boolean;
  children: (loadMoreAction: ReactNode) => ReactNode;
};

export const PaginatedResourceList = ({
  resourceName,
  loadedCount,
  isLoading,
  isLoadingMore,
  hasMore,
  isTruncated,
  loadMore,
  reload,
  isShowingDetail,
  children,
}: Props) => {
  const [searchText, setSearchText] = useState("");
  const canLoadMore = hasMore;
  const action = canLoadMore ? (
    <Action title={`Load More ${resourceName}`} icon={Icon.ArrowDown} onAction={loadMore} />
  ) : null;
  const reloadAction =
    isTruncated && reload ? <Action title="Reload from Start" icon={Icon.ArrowClockwise} onAction={reload} /> : null;
  const actions =
    action || reloadAction ? (
      <>
        {action}
        {reloadAction}
      </>
    ) : null;
  const incomplete = canLoadMore || isTruncated;
  const name = resourceName.toLowerCase();

  return (
    <List
      isLoading={isLoading || isLoadingMore}
      filtering
      onSearchTextChange={setSearchText}
      searchBarPlaceholder={`Search loaded ${name}...`}
      isShowingDetail={isShowingDetail}
    >
      <List.EmptyView
        icon={Icon.MagnifyingGlass}
        title={searchText && incomplete ? `No loaded ${name} match this search` : `No ${name} found`}
        description={
          isTruncated
            ? `The latest ${RESOURCE_LIMIT} loaded ${name} are searchable. Load more to continue, or reload from start to revisit earlier results.`
            : canLoadMore
              ? `More ${name} may exist. Load more to expand the searchable set.`
              : undefined
        }
        actions={actions ? <ActionPanel>{actions}</ActionPanel> : undefined}
      />
      {children(actions)}
      {canLoadMore && (
        <List.Item
          id="load-more-resources"
          title={`Load More ${resourceName}`}
          keywords={[searchText]}
          icon={Icon.ArrowDown}
          accessories={[{ text: `${loadedCount} loaded` }]}
          subtitle={loadedCount >= RESOURCE_LIMIT ? "Loading more replaces the oldest displayed results" : undefined}
          actions={<ActionPanel>{actions}</ActionPanel>}
        />
      )}
      {isTruncated && (
        <List.Item
          id="resources-truncated"
          title={`Showing Latest ${RESOURCE_LIMIT} Loaded ${resourceName}`}
          subtitle="Earlier loaded results are omitted. Reload from start to revisit them."
          keywords={[searchText]}
          icon={Icon.ExclamationMark}
          accessories={[{ text: `${loadedCount} loaded` }]}
          actions={actions ? <ActionPanel>{actions}</ActionPanel> : undefined}
        />
      )}
    </List>
  );
};

import { useState, type ReactNode } from "react";
import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { RESOURCE_LIMIT } from "../pagination/pages";
import { ResourcePagination } from "../pagination/types";
import { SearchDiagnosticsAction } from "./SearchDiagnosticsAction";

type Props = ResourcePagination & {
  projectId?: string;
  resourceName: string;
  loadedCount: number;
  isShowingDetail?: boolean;
  children: (loadMoreAction: ReactNode) => ReactNode;
  searchText?: string;
  onSearchTextChange?: (text: string) => void;
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
  searchText: controlledSearchText,
  onSearchTextChange,
  isSearching = false,
  pagesSearched = 0,
  resourcesSearched = 0,
  projectId,
}: Props) => {
  const [localSearchText, setLocalSearchText] = useState("");
  const searchText = controlledSearchText ?? localSearchText;
  const searching = Boolean(searchText.trim());
  const canLoadMore = hasMore;
  const action = canLoadMore ? (
    <Action title={`Load More ${resourceName}`} icon={Icon.ArrowDown} onAction={loadMore} />
  ) : null;
  const reloadAction =
    isTruncated && reload ? <Action title="Reload from Start" icon={Icon.ArrowClockwise} onAction={reload} /> : null;
  const diagnosticsAction =
    projectId && searching ? (
      <SearchDiagnosticsAction
        projectId={projectId}
        resourceName={resourceName}
        searchText={searchText}
        isLoading={isLoading || isLoadingMore}
        isSearching={isSearching}
        pagesSearched={pagesSearched}
        resourcesSearched={resourcesSearched}
        displayedCount={loadedCount}
        hasMore={hasMore}
        isTruncated={isTruncated}
      />
    ) : null;
  const actions =
    action || reloadAction || diagnosticsAction ? (
      <>
        {action}
        {reloadAction}
        {diagnosticsAction}
      </>
    ) : null;
  const name = resourceName.toLowerCase();

  return (
    <List
      isLoading={isLoading || isLoadingMore}
      filtering={false}
      throttle
      searchText={searchText}
      onSearchTextChange={(text) => {
        setLocalSearchText(text);
        onSearchTextChange?.(text);
      }}
      searchBarPlaceholder={`Search all ${name}...`}
      isShowingDetail={isShowingDetail}
    >
      <List.EmptyView
        icon={Icon.MagnifyingGlass}
        title={
          isSearching ? `Searching all ${name}...` : searchText ? `No ${name} match this search` : `No ${name} found`
        }
        description={
          isSearching
            ? `${pagesSearched} API pages checked. Searching includes resources outside the displayed results.`
            : isTruncated
              ? searching
                ? "More than 500 resources match. Refine the search to find a specific resource."
                : "Earlier displayed results are omitted. Search to find them, or reload from start."
              : canLoadMore
                ? searchText
                  ? "More matching results may exist. Load more to continue searching."
                  : `More ${name} may exist. Search to find them, or load more.`
                : searching && !isLoading && projectId
                  ? `Checked ${resourcesSearched} ${name} across ${pagesSearched} API pages.`
                  : undefined
        }
        actions={actions ? <ActionPanel>{actions}</ActionPanel> : undefined}
      />
      {isSearching && (
        <List.Item
          id="resource-search-progress"
          title={`Searching all ${resourceName}...`}
          icon={Icon.MagnifyingGlass}
          accessories={[{ text: `${pagesSearched} API pages checked` }]}
          actions={diagnosticsAction ? <ActionPanel>{diagnosticsAction}</ActionPanel> : undefined}
        />
      )}
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
          title={
            searching
              ? `Showing Top ${RESOURCE_LIMIT} Matches`
              : `Showing Latest ${RESOURCE_LIMIT} Loaded ${resourceName}`
          }
          subtitle={
            searching
              ? "Refine the search to narrow the results."
              : "Search to find earlier results, or reload from start."
          }
          keywords={[searchText]}
          icon={Icon.ExclamationMark}
          accessories={[{ text: `${loadedCount} loaded` }]}
          actions={actions ? <ActionPanel>{actions}</ActionPanel> : undefined}
        />
      )}
    </List>
  );
};

import { useState } from "react";
import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { OpenCloudLoggingAction } from "../actions/cloud-logging/OpenCloudLoggingAction";
import { ErrorDetail } from "../components/ErrorDetail";
import { useCloudFunctions } from "./useCloudFunctions";

type Props = {
  projectId: string;
};

export const CloudFunctionList = ({ projectId }: Props) => {
  const [searchText, setSearchText] = useState("");
  const { functions, isLoading, isLoadingMore, hasMore, isTruncated, loadMore, error } = useCloudFunctions(projectId);

  if (error) {
    return <ErrorDetail error={error} />;
  }

  const canLoadMore = hasMore && !isTruncated;
  const loadMoreAction = canLoadMore ? (
    <Action title="Load More Functions" icon={Icon.ArrowDown} onAction={loadMore} />
  ) : undefined;

  return (
    <List
      isLoading={isLoading || isLoadingMore}
      filtering
      onSearchTextChange={setSearchText}
      searchBarPlaceholder="Search loaded Cloud Functions (gen1)..."
    >
      <List.EmptyView
        icon={Icon.MagnifyingGlass}
        title={searchText && canLoadMore ? "No loaded functions match this search" : "No Cloud Functions found"}
        description={
          searchText && canLoadMore
            ? "More functions may exist. Load more functions to expand the searchable set."
            : isTruncated
              ? "The Cloud Functions list is truncated to keep memory usage bounded."
              : undefined
        }
        actions={loadMoreAction ? <ActionPanel>{loadMoreAction}</ActionPanel> : undefined}
      />
      {functions?.map((cloudFunction) => (
        <List.Item
          key={cloudFunction.id}
          id={cloudFunction.id}
          title={cloudFunction.name}
          icon={Icon.Box}
          keywords={cloudFunction.keywords}
          accessories={[
            { text: cloudFunction.region },
            { text: cloudFunction.runtime },
            { text: cloudFunction.status },
          ].filter((a) => a.text)}
          actions={
            <ActionPanel>
              <Action.OpenInBrowser url={cloudFunction.url} />
              <OpenCloudLoggingAction target={cloudFunction} />
              {loadMoreAction}
            </ActionPanel>
          }
        />
      ))}
      {canLoadMore && (
        <List.Item
          id="load-more-cloud-functions"
          title="Load More Functions"
          icon={Icon.ArrowDown}
          accessories={[{ text: `${functions?.length ?? 0} loaded` }]}
          actions={<ActionPanel>{loadMoreAction}</ActionPanel>}
        />
      )}
      {isTruncated && (
        <List.Item
          id="cloud-functions-truncated"
          title="Cloud Functions List Truncated"
          icon={Icon.ExclamationMark}
          accessories={[{ text: `${functions?.length ?? 0} loaded` }]}
        />
      )}
    </List>
  );
};

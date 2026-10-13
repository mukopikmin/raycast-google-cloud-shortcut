import { RESOURCE_LIMIT } from "../../pagination/pages";
import { useState } from "react";
import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { OpenCloudLoggingAction } from "../../actions/cloud-logging/OpenCloudLoggingAction";
import { ErrorDetail } from "../../components/ErrorDetail";
import { CloudRunDeployment } from "./types";

export type CloudRunDeploymentListResult = {
  deployments: CloudRunDeployment[] | undefined;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  isTruncated: boolean;
  loadMore: () => Promise<void>;
  reload?: () => Promise<void>;
  error: Error | undefined;
  unreachable?: string[];
  isSearching?: boolean;
  pagesSearched?: number;
};

type Props = CloudRunDeploymentListResult & {
  resourceName: string;
  secondaryAction?: (deployment: CloudRunDeployment) => React.ReactNode;
  searchText?: string;
  onSearchTextChange?: (text: string) => void;
};

export const CloudRunDeploymentList = ({
  deployments,
  isLoading,
  isLoadingMore,
  hasMore,
  isTruncated,
  loadMore,
  reload,
  error,
  resourceName,
  secondaryAction,
  unreachable = [],
  searchText: controlledSearchText,
  onSearchTextChange,
  isSearching = false,
  pagesSearched = 0,
}: Props) => {
  const [localSearchText, setLocalSearchText] = useState("");
  const searchText = controlledSearchText ?? localSearchText;
  const canLoadMore = hasMore;

  if (error) {
    return <ErrorDetail error={error} />;
  }

  const loadMoreAction = canLoadMore ? (
    <Action title={`Load More ${resourceName}`} icon={Icon.ArrowDown} onAction={loadMore} />
  ) : null;
  const reloadAction =
    isTruncated && reload ? <Action title="Reload from Start" icon={Icon.ArrowClockwise} onAction={reload} /> : null;

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
      searchBarPlaceholder={`Search all ${resourceName.toLowerCase()}...`}
    >
      <List.EmptyView
        icon={Icon.MagnifyingGlass}
        title={
          isSearching
            ? `Searching all ${resourceName.toLowerCase()}...`
            : searchText
              ? `No ${resourceName.toLowerCase()} match this search`
              : `No ${resourceName.toLowerCase()} found`
        }
        description={
          isSearching
            ? `${pagesSearched} API pages checked. Searching includes resources outside the displayed results.`
            : searchText && hasMore
              ? "More matching results may exist. Load more to continue searching."
              : isTruncated
                ? "Earlier displayed results are omitted. Search again to find them, or reload from start."
                : undefined
        }
        actions={
          loadMoreAction || reloadAction ? (
            <ActionPanel>
              {loadMoreAction}
              {reloadAction}
            </ActionPanel>
          ) : undefined
        }
      />
      {isSearching && (
        <List.Item
          id="cloud-run-search-progress"
          title={`Searching all ${resourceName}...`}
          icon={Icon.MagnifyingGlass}
          accessories={[{ text: `${pagesSearched} API pages checked` }]}
        />
      )}
      {unreachable.length > 0 && (
        <List.Item
          id="cloud-run-services-unreachable"
          title="Some Service Regions Could Not Be Loaded"
          subtitle="Service results may be incomplete"
          icon={Icon.ExclamationMark}
          keywords={[searchText]}
          accessories={[{ text: unreachable.join(", ") }].filter((a) => a.text)}
          actions={
            <ActionPanel>
              <Action.Push
                title="Show Unavailable Regions"
                target={
                  <ErrorDetail
                    error={
                      new Error(
                        `Cloud Run services could not be loaded from: ${unreachable.join(", ")}. Results from other regions are shown. Reopen the list to retry.`,
                      )
                    }
                  />
                }
              />
              {loadMoreAction}
              {reloadAction}
            </ActionPanel>
          }
        />
      )}
      {deployments?.map((deployment) => (
        <List.Item
          key={deployment.id}
          id={deployment.id}
          icon={Icon.Box}
          title={deployment.name}
          keywords={deployment.keywords}
          accessories={[{ text: deployment.deployType }, { text: deployment.region }].filter((a) => a.text)}
          actions={
            <ActionPanel>
              <Action.OpenInBrowser url={deployment.url} />
              <OpenCloudLoggingAction target={deployment} />
              {deployment.uri && <Action.CopyToClipboard title="Copy Primary URL" content={deployment.uri} />}
              {secondaryAction?.(deployment)}
              {loadMoreAction}
              {reloadAction}
            </ActionPanel>
          }
        />
      ))}
      {canLoadMore && (
        <List.Item
          id={`load-more-cloud-run-${resourceName.toLowerCase().replaceAll(" ", "-")}`}
          title={`Load More ${resourceName}`}
          keywords={[searchText]}
          icon={Icon.ArrowDown}
          accessories={[{ text: `${deployments?.length ?? 0} loaded` }].filter((a) => a.text)}
          subtitle={
            (deployments?.length ?? 0) >= RESOURCE_LIMIT
              ? "Loading more replaces the oldest displayed results"
              : undefined
          }
          actions={<ActionPanel>{loadMoreAction}</ActionPanel>}
        />
      )}
      {isTruncated && (
        <List.Item
          id={`cloud-run-${resourceName.toLowerCase().replaceAll(" ", "-")}-truncated`}
          title={`Showing Latest ${RESOURCE_LIMIT} Loaded ${resourceName}`}
          subtitle="Search again to find earlier results, or reload from start."
          keywords={[searchText]}
          icon={Icon.ExclamationMark}
          accessories={[{ text: `${deployments?.length ?? 0} loaded` }].filter((a) => a.text)}
          actions={reloadAction ? <ActionPanel>{reloadAction}</ActionPanel> : undefined}
        />
      )}
    </List>
  );
};

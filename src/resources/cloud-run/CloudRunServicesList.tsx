import { useState } from "react";
import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { OpenCloudLoggingAction } from "../../actions/cloud-logging/OpenCloudLoggingAction";
import { useCloudRunDeployments } from "./useCloudRunDeployments";
import { ErrorDetail } from "../../components/ErrorDetail";
import { useLoadMoreOnSearch } from "../../hooks/useLoadMoreOnSearch";

type Props = {
  projectId: string;
};

export const CloudRunServicesList = (props: Props) => {
  const [searchText, setSearchText] = useState("");
  const { deployments, isLoading, isLoadingMore, hasMore, isTruncated, loadMore, error } = useCloudRunDeployments(
    props.projectId,
  );

  const canLoadMore = hasMore && !isTruncated;
  useLoadMoreOnSearch({ searchText, canLoadMore, isLoading, isLoadingMore, loadMore });

  if (error) {
    return <ErrorDetail error={error} />;
  }

  const loadMoreAction = canLoadMore ? (
    <Action title="Load More Deployments" icon={Icon.ArrowDown} onAction={loadMore} />
  ) : null;

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
      searchBarPlaceholder="Search loaded deployments..."
    >
      <List.EmptyView
        icon={Icon.MagnifyingGlass}
        title={searchText && hasMore ? "No loaded deployments match this search" : "No deployments found"}
        description={
          searchText && hasMore
            ? "More deployments may exist. Load more deployments to expand the searchable set."
            : isTruncated
              ? "The deployment list is truncated to keep memory usage bounded."
              : undefined
        }
        actions={loadMoreAction ? <ActionPanel>{loadMoreAction}</ActionPanel> : undefined}
      />
      {deployments?.map((deployment) => {
        return (
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
                {(deployment.deployType === "Container Services" || deployment.deployType === "Function Services") && (
                  <Action.OpenInBrowser
                    title="Open Revisions in Browser"
                    url={`https://console.cloud.google.com/run/detail/${deployment.region}/${deployment.name}/revisions?project=${props.projectId}`}
                    icon={Icon.ChevronRight}
                  />
                )}
                {deployment.deployType === "Jobs" && (
                  <Action.OpenInBrowser
                    title="Open Executions in Browser"
                    url={`https://console.cloud.google.com/run/jobs/details/${deployment.region}/${deployment.name}/executions?project=${props.projectId}`}
                    icon={Icon.ChevronRight}
                  />
                )}
                {loadMoreAction}
              </ActionPanel>
            }
          />
        );
      })}
      {canLoadMore && (
        <List.Item
          id="load-more-cloud-run-deployments"
          title="Load More Deployments"
          icon={Icon.ArrowDown}
          accessories={[{ text: `${deployments?.length ?? 0} loaded` }]}
          actions={<ActionPanel>{loadMoreAction}</ActionPanel>}
        />
      )}
      {isTruncated && (
        <List.Item
          id="cloud-run-deployments-truncated"
          title="Deployment List Truncated"
          icon={Icon.ExclamationMark}
          accessories={[{ text: `${deployments?.length ?? 0} loaded` }]}
        />
      )}
    </List>
  );
};

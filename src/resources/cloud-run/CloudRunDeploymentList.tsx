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
  error: Error | undefined;
};

type Props = CloudRunDeploymentListResult & {
  resourceName: string;
  secondaryAction?: (deployment: CloudRunDeployment) => React.ReactNode;
};

export const CloudRunDeploymentList = ({
  deployments,
  isLoading,
  isLoadingMore,
  hasMore,
  isTruncated,
  loadMore,
  error,
  resourceName,
  secondaryAction,
}: Props) => {
  const [searchText, setSearchText] = useState("");
  const canLoadMore = hasMore && !isTruncated;

  if (error) {
    return <ErrorDetail error={error} />;
  }

  const loadMoreAction = canLoadMore ? (
    <Action title={`Load More ${resourceName}`} icon={Icon.ArrowDown} onAction={loadMore} />
  ) : null;

  return (
    <List
      isLoading={isLoading || isLoadingMore}
      filtering
      onSearchTextChange={setSearchText}
      searchBarPlaceholder={`Search loaded ${resourceName.toLowerCase()}...`}
    >
      <List.EmptyView
        icon={Icon.MagnifyingGlass}
        title={
          searchText && hasMore
            ? `No loaded ${resourceName.toLowerCase()} match this search`
            : `No ${resourceName.toLowerCase()} found`
        }
        description={
          searchText && hasMore
            ? `More ${resourceName.toLowerCase()} may exist. Load more to expand the searchable set.`
            : isTruncated
              ? `The ${resourceName.toLowerCase()} list is truncated to keep memory usage bounded.`
              : undefined
        }
        actions={loadMoreAction ? <ActionPanel>{loadMoreAction}</ActionPanel> : undefined}
      />
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
            </ActionPanel>
          }
        />
      ))}
      {canLoadMore && (
        <List.Item
          id={`load-more-cloud-run-${resourceName.toLowerCase().replaceAll(" ", "-")}`}
          title={`Load More ${resourceName}`}
          icon={Icon.ArrowDown}
          accessories={[{ text: `${deployments?.length ?? 0} loaded` }].filter((a) => a.text)}
          actions={<ActionPanel>{loadMoreAction}</ActionPanel>}
        />
      )}
      {isTruncated && (
        <List.Item
          id={`cloud-run-${resourceName.toLowerCase().replaceAll(" ", "-")}-truncated`}
          title={`${resourceName} List Truncated`}
          icon={Icon.ExclamationMark}
          accessories={[{ text: `${deployments?.length ?? 0} loaded` }].filter((a) => a.text)}
        />
      )}
    </List>
  );
};

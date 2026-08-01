import { useState } from "react";
import { ActionPanel, Action, Icon, List } from "@raycast/api";
import { useKubernetesEngineClusters } from "./useKubernetesEngineClusters";
import { ErrorDetail } from "../../components/ErrorDetail";
import { withGoogleAccessToken } from "../../auth/google";
import { createKubernetesEngineClusterUrl } from "./types";

type Props = {
  projectId: string;
};

const KubernetesEngineClusterListComponent = ({ projectId }: Props) => {
  const [searchText, setSearchText] = useState("");
  const { clusters, isLoading, isLoadingMore, hasMore, isTruncated, loadMore, error } =
    useKubernetesEngineClusters(projectId);

  if (error) {
    return <ErrorDetail error={error} />;
  }

  const canLoadMore = hasMore && !isTruncated;
  const loadMoreAction = canLoadMore ? (
    <Action title="Load More Clusters" icon={Icon.ArrowDown} onAction={loadMore} />
  ) : undefined;

  return (
    <List
      isLoading={isLoading || isLoadingMore}
      filtering
      onSearchTextChange={setSearchText}
      searchBarPlaceholder="Search loaded Kubernetes Engine clusters..."
    >
      <List.EmptyView
        icon={Icon.MagnifyingGlass}
        title={
          searchText && canLoadMore ? "No loaded clusters match this search" : "No Kubernetes Engine clusters found"
        }
        description={
          searchText && canLoadMore
            ? "More clusters may exist. Load more clusters to expand the searchable set."
            : isTruncated
              ? "The Kubernetes Engine cluster list is truncated to keep memory usage bounded."
              : undefined
        }
        actions={loadMoreAction ? <ActionPanel>{loadMoreAction}</ActionPanel> : undefined}
      />
      {clusters?.map((cluster) => (
        <List.Item
          key={cluster.id}
          title={cluster.name}
          subtitle={cluster.endpoint}
          icon={Icon.Network}
          accessories={[
            { text: cluster.location, tooltip: "Location" },
            { text: cluster.status, tooltip: "Status" },
            { text: cluster.version, tooltip: "Master Version" },
            { text: `${cluster.nodeCount} nodes`, tooltip: "Node Count" },
          ].filter((a) => a.text)}
          actions={
            <ActionPanel>
              <Action.OpenInBrowser title="Open in Cloud Console" url={createKubernetesEngineClusterUrl(cluster)} />
              <Action.CopyToClipboard title="Copy Cluster Name" content={cluster.name} />
              {cluster.endpoint && <Action.CopyToClipboard title="Copy Endpoint" content={cluster.endpoint} />}
              {loadMoreAction}
            </ActionPanel>
          }
        />
      ))}
      {canLoadMore && (
        <List.Item
          id="load-more-kubernetes-engine-clusters"
          title="Load More Clusters"
          icon={Icon.ArrowDown}
          accessories={[{ text: `${clusters?.length ?? 0} loaded` }]}
          actions={<ActionPanel>{loadMoreAction}</ActionPanel>}
        />
      )}
      {isTruncated && (
        <List.Item
          id="kubernetes-engine-clusters-truncated"
          title="Kubernetes Engine Cluster List Truncated"
          icon={Icon.ExclamationMark}
          accessories={[{ text: `${clusters?.length ?? 0} loaded` }]}
        />
      )}
    </List>
  );
};

export const KubernetesEngineClusterList = withGoogleAccessToken(KubernetesEngineClusterListComponent);

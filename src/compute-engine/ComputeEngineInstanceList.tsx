import { useState } from "react";
import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { useComputeEngineInstances } from "./useComputeEngineInstances";
import { ErrorDetail } from "../components/ErrorDetail";

type Props = {
  projectId: string;
};

export const ComputeEngineInstanceList = (props: Props) => {
  const [searchText, setSearchText] = useState("");
  const { instances, isLoading, isLoadingMore, hasMore, isTruncated, loadMore, error } = useComputeEngineInstances(
    props.projectId,
  );

  if (error) {
    return <ErrorDetail error={error} />;
  }

  const canLoadMore = hasMore && !isTruncated;
  const loadMoreAction = canLoadMore ? (
    <Action title="Load More Instances" icon={Icon.ArrowDown} onAction={loadMore} />
  ) : undefined;

  return (
    <List
      isLoading={isLoading || isLoadingMore}
      filtering
      onSearchTextChange={setSearchText}
      searchBarPlaceholder="Search loaded Compute Engine instances..."
    >
      <List.EmptyView
        icon={Icon.MagnifyingGlass}
        title={
          searchText && canLoadMore ? "No loaded instances match this search" : "No Compute Engine instances found"
        }
        description={
          searchText && canLoadMore
            ? "More instances may exist. Load more instances to expand the searchable set."
            : isTruncated
              ? "The Compute Engine instance list is truncated to keep memory usage bounded."
              : undefined
        }
        actions={loadMoreAction ? <ActionPanel>{loadMoreAction}</ActionPanel> : undefined}
      />
      {instances?.map((instance) => {
        const ips = [instance.internalIp, instance.externalIp].filter(Boolean).join(" / ");
        return (
          <List.Item
            key={instance.id}
            id={instance.id}
            icon={Icon.ComputerChip}
            title={instance.name}
            subtitle={ips}
            accessories={[{ text: instance.zone }, { text: instance.machineType }, { text: instance.status }].filter(
              (a) => a.text,
            )}
            actions={
              <ActionPanel>
                <Action.OpenInBrowser url={instance.url} />
                <Action.CopyToClipboard title="Copy Instance ID" content={instance.id} />
                {instance.internalIp && (
                  <Action.CopyToClipboard title="Copy Internal IP" content={instance.internalIp} />
                )}
                {instance.externalIp && (
                  <Action.CopyToClipboard title="Copy External IP" content={instance.externalIp} />
                )}
                {loadMoreAction}
              </ActionPanel>
            }
          />
        );
      })}
      {canLoadMore && (
        <List.Item
          id="load-more-compute-engine-instances"
          title="Load More Instances"
          icon={Icon.ArrowDown}
          accessories={[{ text: `${instances?.length ?? 0} loaded` }]}
          actions={<ActionPanel>{loadMoreAction}</ActionPanel>}
        />
      )}
      {isTruncated && (
        <List.Item
          id="compute-engine-instances-truncated"
          title="Compute Engine Instance List Truncated"
          icon={Icon.ExclamationMark}
          accessories={[{ text: `${instances?.length ?? 0} loaded` }]}
        />
      )}
    </List>
  );
};

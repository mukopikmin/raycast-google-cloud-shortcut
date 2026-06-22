import { useState } from "react";
import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { ErrorDetail } from "../components/ErrorDetail";
import { useAlertPolicies } from "./useAlertPolicies";

type Props = {
  projectId: string;
};

export const AlertPolicyList = ({ projectId }: Props) => {
  const [searchText, setSearchText] = useState("");
  const { alertPolicies, isLoading, isLoadingMore, hasMore, isTruncated, loadMore, error } =
    useAlertPolicies(projectId);

  if (error) {
    return <ErrorDetail error={error} />;
  }

  const canLoadMore = hasMore && !isTruncated;
  const loadMoreAction = canLoadMore ? (
    <Action title="Load More Alert Policies" icon={Icon.ArrowDown} onAction={loadMore} />
  ) : undefined;

  return (
    <List
      isLoading={isLoading || isLoadingMore}
      filtering
      onSearchTextChange={setSearchText}
      searchBarPlaceholder="Search loaded alert policies..."
    >
      <List.EmptyView
        icon={Icon.MagnifyingGlass}
        title={searchText && canLoadMore ? "No loaded alert policies match this search" : "No alert policies found"}
        description={
          searchText && canLoadMore
            ? "More alert policies may exist. Load more policies to expand the searchable set."
            : isTruncated
              ? "The alert policy list is truncated to keep memory usage bounded."
              : undefined
        }
        actions={loadMoreAction ? <ActionPanel>{loadMoreAction}</ActionPanel> : undefined}
      />
      {alertPolicies?.map((policy) => (
        <List.Item
          key={policy.id}
          id={policy.id}
          title={policy.displayName}
          subtitle={policy.id}
          icon={Icon.Box}
          keywords={policy.keywords}
          accessories={[
            { text: policy.enabled === undefined ? undefined : policy.enabled ? "Enabled" : "Disabled" },
            { text: policy.severity && policy.severity !== "SEVERITY_UNSPECIFIED" ? policy.severity : undefined },
            { text: `${policy.conditionCount} condition${policy.conditionCount === 1 ? "" : "s"}` },
          ].filter((accessory) => accessory.text)}
          actions={
            <ActionPanel>
              <Action.OpenInBrowser url={policy.url} />
              <Action.CopyToClipboard title="Copy Alert Policy ID" content={policy.id} />
              {loadMoreAction}
            </ActionPanel>
          }
        />
      ))}
      {canLoadMore && (
        <List.Item
          id="load-more-alert-policies"
          title="Load More Alert Policies"
          icon={Icon.ArrowDown}
          accessories={[{ text: `${alertPolicies?.length ?? 0} loaded` }].filter((accessory) => accessory.text)}
          actions={<ActionPanel>{loadMoreAction}</ActionPanel>}
        />
      )}
      {isTruncated && (
        <List.Item
          id="alert-policies-truncated"
          title="Alert Policy List Truncated"
          icon={Icon.ExclamationMark}
          accessories={[{ text: `${alertPolicies?.length ?? 0} loaded` }].filter((accessory) => accessory.text)}
        />
      )}
    </List>
  );
};

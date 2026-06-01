import { useState } from "react";
import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { useSecretManager } from "./useSecretManager";
import { ErrorDetail } from "../components/ErrorDetail";

type Props = {
  projectId: string;
};

export const SecretManagerList = (props: Props) => {
  const [searchText, setSearchText] = useState("");
  const { secrets, isLoading, isLoadingMore, hasMore, isTruncated, loadMore, error } = useSecretManager(
    props.projectId,
  );

  if (error) {
    return <ErrorDetail error={error} />;
  }

  const canLoadMore = hasMore && !isTruncated;
  const loadMoreAction = canLoadMore ? (
    <Action title="Load More Secrets" icon={Icon.ArrowDown} onAction={loadMore} />
  ) : undefined;

  return (
    <List
      isLoading={isLoading || isLoadingMore}
      filtering
      onSearchTextChange={setSearchText}
      searchBarPlaceholder="Search loaded secrets..."
    >
      <List.EmptyView
        icon={Icon.MagnifyingGlass}
        title={searchText && canLoadMore ? "No loaded secrets match this search" : "No secrets found"}
        description={
          searchText && canLoadMore
            ? "More secrets may exist. Load more secrets to expand the searchable set."
            : isTruncated
              ? "The secret list is truncated to keep memory usage bounded."
              : undefined
        }
        actions={loadMoreAction ? <ActionPanel>{loadMoreAction}</ActionPanel> : undefined}
      />
      {secrets?.map((secret) => (
        <List.Item
          key={secret.id}
          id={secret.id}
          title={secret.name}
          icon={Icon.Box}
          actions={
            <ActionPanel>
              <Action.OpenInBrowser url={secret.url} />
              {loadMoreAction}
            </ActionPanel>
          }
        />
      ))}
      {canLoadMore && (
        <List.Item
          id="load-more-secrets"
          title="Load More Secrets"
          icon={Icon.ArrowDown}
          accessories={[{ text: `${secrets?.length ?? 0} loaded` }]}
          actions={<ActionPanel>{loadMoreAction}</ActionPanel>}
        />
      )}
      {isTruncated && (
        <List.Item
          id="secret-manager-secrets-truncated"
          title="Secret List Truncated"
          icon={Icon.ExclamationMark}
          accessories={[{ text: `${secrets?.length ?? 0} loaded` }]}
        />
      )}
    </List>
  );
};

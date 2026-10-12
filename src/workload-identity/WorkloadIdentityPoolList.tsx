import { PaginatedResourceList } from "../components/PaginatedResourceList";
import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { ErrorDetail } from "../components/ErrorDetail";
import { useWorkloadIdentityPools } from "./useWorkloadIdentityPools";
import { withGoogleAccessToken } from "../auth/google";

type Props = {
  projectId: string;
};

const formatEnum = (value: string) =>
  value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const WorkloadIdentityPoolListComponent = ({ projectId }: Props) => {
  const { pools, error, ...pagination } = useWorkloadIdentityPools(projectId);

  if (error) {
    return <ErrorDetail error={error} />;
  }

  return (
    <PaginatedResourceList {...pagination} resourceName="Workload Identity Pools" loadedCount={pools.length}>
      {(loadMoreAction) =>
        pools.map((pool) => (
          <List.Item
            key={pool.id}
            id={pool.id}
            icon={Icon.TwoPeople}
            title={pool.name}
            subtitle={pool.name === pool.id ? undefined : pool.id}
            keywords={pool.keywords}
            accessories={[
              { text: pool.disabled ? "Disabled" : formatEnum(pool.state) },
              { text: pool.mode ? formatEnum(pool.mode) : undefined },
            ].filter((accessory) => accessory.text)}
            actions={
              <ActionPanel>
                <Action.OpenInBrowser title="Open in Google Cloud Console" url={pool.url} />
                <Action.CopyToClipboard title="Copy Pool ID" content={pool.id} />
                {loadMoreAction}
              </ActionPanel>
            }
          />
        ))
      }
    </PaginatedResourceList>
  );
};

export const WorkloadIdentityPoolList = withGoogleAccessToken(WorkloadIdentityPoolListComponent);

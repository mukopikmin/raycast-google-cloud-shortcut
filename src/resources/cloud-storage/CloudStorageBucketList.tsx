import { PaginatedResourceList } from "../../components/PaginatedResourceList";
import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { useCloudStorage } from "./useCloudStorage";
import { ErrorDetail } from "../../components/ErrorDetail";
import { withGoogleAccessToken } from "../../auth/google";

type Props = {
  projectId: string;
};

const CloudStorageBucketListComponent = (props: Props) => {
  const { buckets, error, ...pagination } = useCloudStorage(props.projectId);

  if (error) {
    return <ErrorDetail error={error} />;
  }

  return (
    <PaginatedResourceList {...pagination} resourceName="Buckets" loadedCount={buckets.length}>
      {(loadMoreAction) =>
        buckets.map((bucket) => (
          <List.Item
            key={bucket.id}
            id={bucket.id}
            title={bucket.name}
            icon={Icon.Box}
            accessories={[{ text: bucket.location }].filter((a) => a.text)}
            actions={
              <ActionPanel>
                <Action.OpenInBrowser url={bucket.url} />
                {loadMoreAction}
              </ActionPanel>
            }
          />
        ))
      }
    </PaginatedResourceList>
  );
};

export const CloudStorageBucketList = withGoogleAccessToken(CloudStorageBucketListComponent);

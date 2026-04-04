import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { useCloudStorage } from "./useCloudStorage";
import { ErrorDetail } from "../components/ErrorDetail";

type Props = {
  projectId: string;
};

export const CloudStorageBucketList = (props: Props) => {
  const { buckets, isLoading, error } = useCloudStorage(props.projectId);

  if (error) {
    return <ErrorDetail error={error} />;
  }

  return (
    <List isLoading={isLoading}>
      {buckets?.map((bucket) => (
        <List.Item
          key={bucket.id}
          id={bucket.id}
          title={bucket.name}
          subtitle={bucket.location}
          icon={Icon.Box}
          actions={
            <ActionPanel>
              <Action.OpenInBrowser url={bucket.url} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
};

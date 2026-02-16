import { List } from "@raycast/api";
import { useStorage } from "./use-storage";

type Props = {
  projectId: string;
};

export const StorageBucketList = (props: Props) => {
  const { buckets, isLoading } = useStorage(props.projectId);

  return (
    <List isLoading={isLoading}>
      {buckets?.map((bucket) => (
        <List.Item key={bucket.id} id={bucket.id} title={bucket.name} subtitle={bucket.location} />
      ))}
    </List>
  );
};

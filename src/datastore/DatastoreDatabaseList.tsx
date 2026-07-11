import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { ErrorDetail } from "../components/ErrorDetail";
import { useDatastoreDatabases } from "./useDatastoreDatabases";

type Props = {
  projectId: string;
};

export const DatastoreDatabaseList = ({ projectId }: Props) => {
  const { databases, isLoading, error } = useDatastoreDatabases(projectId);

  if (error) {
    return <ErrorDetail error={error} />;
  }

  return (
    <List isLoading={isLoading} searchBarPlaceholder="Search Datastore databases...">
      <List.EmptyView icon={Icon.MagnifyingGlass} title="No Datastore databases found" />
      {databases?.map((database) => (
        <List.Item
          key={database.id}
          id={database.id}
          title={database.id}
          icon={Icon.Box}
          accessories={[{ text: database.location }, { text: database.edition }].filter((accessory) => accessory.text)}
          actions={
            <ActionPanel>
              <Action.OpenInBrowser url={database.url} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
};

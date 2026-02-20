import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { useSqls } from "./useSqls";

type Props = {
  projectId: string;
};

export const SqlList = (props: Props) => {
  const { sqls, isLoading } = useSqls(props.projectId);

  return (
    <List isLoading={isLoading}>
      {sqls?.map((sql) => (
        <List.Item
          key={sql.id}
          id={sql.id}
          icon={Icon.Box}
          title={sql.id}
          subtitle={`${sql.region} ${sql.state}`}
          actions={
            <ActionPanel>
              <Action.OpenInBrowser url={sql.url} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
};

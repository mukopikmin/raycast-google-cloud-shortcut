import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { useRuns } from "./useRuns";

type Props = {
  projectId: string;
};

export const RunList = (props: Props) => {
  const { runs, isLoading } = useRuns(props.projectId);

  return (
    <List isLoading={isLoading}>
      {runs?.map((run) => {
        return (
          <List.Item
            key={run.id}
            id={run.id}
            icon={Icon.Box}
            title={run.name}
            subtitle={run.region}
            actions={
              <ActionPanel>
                <Action.OpenInBrowser url={run.url} />
              </ActionPanel>
            }
          />
        );
      })}
    </List>
  );
};

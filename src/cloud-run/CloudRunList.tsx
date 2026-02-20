import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { useCloudRuns } from "./useCloudRuns";

type Props = {
  projectId: string;
};

export const CloudRunList = (props: Props) => {
  const { runs, isLoading } = useCloudRuns(props.projectId);

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

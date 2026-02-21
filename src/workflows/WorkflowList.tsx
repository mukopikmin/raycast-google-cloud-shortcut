import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { useWorkflows } from "./useWorkflows";

type Props = {
  projectId: string;
};

export const WorkflowList = ({ projectId }: Props) => {
  const { workflows, isLoading } = useWorkflows(projectId);

  return (
    <List isLoading={isLoading}>
      {workflows?.map((workflow) => (
        <List.Item
          key={workflow.name}
          id={workflow.name}
          title={workflow.name}
          subtitle={workflow.region}
          icon={Icon.Box}
          actions={
            <ActionPanel>
              <Action.OpenInBrowser url={workflow.url} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
};

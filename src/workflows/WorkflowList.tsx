import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { useWorkflows } from "./useWorkflows";
import { ErrorDetail } from "../components/ErrorDetail";

type Props = {
  projectId: string;
};

export const WorkflowList = ({ projectId }: Props) => {
  const { workflows, isLoading, error } = useWorkflows(projectId);

  if (error) {
    return <ErrorDetail error={error} />;
  }

  return (
    <List isLoading={isLoading}>
      {workflows?.map((workflow) => (
        <List.Item
          key={workflow.name}
          id={workflow.name}
          title={workflow.name}
          icon={Icon.Box}
          accessories={[{ text: workflow.region }]}
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

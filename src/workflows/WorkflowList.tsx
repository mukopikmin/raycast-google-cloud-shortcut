import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { useWorkflows } from "./useWorkflows";
import { ErrorDetail } from "../components/ErrorDetail";
import { OpenCloudLoggingAction } from "../actions/cloud-logging/OpenCloudLoggingAction";

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
          accessories={[{ text: workflow.region }].filter((a) => a.text)}
          actions={
            <ActionPanel>
              <Action.OpenInBrowser url={workflow.url} />
              <OpenCloudLoggingAction target={workflow} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
};

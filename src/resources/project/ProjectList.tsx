import { ActionPanel, Action, Icon, List } from "@raycast/api";
import { ErrorDetail } from "../../components/ErrorDetail";
import { ServiceList } from "../../service/ServiceList";
import { useProjects } from "./useProjects";
import { useProjectHistory } from "./useProjectHistory";
import { sortProjectsByRecency } from "./history";

export const ProjectList = () => {
  const { projects, isLoading, error, refreshProjects } = useProjects();
  const history = useProjectHistory();
  const displayError = error || history.error;

  if (displayError) {
    return <ErrorDetail error={displayError} />;
  }

  return (
    <List isLoading={isLoading || history.isLoading}>
      <List.EmptyView
        title="No Projects"
        actions={
          <ActionPanel>
            <Action title="Refresh Projects" icon={Icon.ArrowClockwise} onAction={refreshProjects} />
          </ActionPanel>
        }
      />
      {sortProjectsByRecency(history.isLoading ? [] : (projects ?? []), history.recentProjects).map((project) => (
        <List.Item
          key={project.id}
          id={project.id}
          icon={Icon.Cloud}
          title={project.name}
          subtitle={project.id}
          actions={
            <ActionPanel>
              <Action.Push
                title="Show Google Cloud Services"
                target={<ServiceList projectId={project.id} />}
                onPush={() => void history.recordSelection(project.id)}
              />
              <Action title="Refresh Projects" icon={Icon.ArrowClockwise} onAction={refreshProjects} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
};

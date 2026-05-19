import { ActionPanel, Action, Icon, List } from "@raycast/api";
import { ErrorDetail } from "../components/ErrorDetail";
import { ServiceList } from "../service/ServiceList";
import { useProjects } from "./useProjects";

export const ProjectList = () => {
  const { projects, isLoading, error, refreshProjects } = useProjects();

  if (error) {
    return <ErrorDetail error={error} />;
  }

  return (
    <List isLoading={isLoading}>
      <List.EmptyView
        title="No Projects"
        actions={
          <ActionPanel>
            <Action title="Refresh Projects" icon={Icon.ArrowClockwise} onAction={refreshProjects} />
          </ActionPanel>
        }
      />
      {projects?.map((project) => (
        <List.Item
          key={project.id}
          id={project.id}
          icon={Icon.Cloud}
          title={project.name}
          subtitle={project.id}
          actions={
            <ActionPanel>
              <Action.Push title="Show Google Cloud Services" target={<ServiceList projectId={project.id} />} />
              <Action title="Refresh Projects" icon={Icon.ArrowClockwise} onAction={refreshProjects} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
};

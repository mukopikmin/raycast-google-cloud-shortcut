import { ActionPanel, Action, Icon, List } from "@raycast/api";
import { ServiceList } from "./service-list";
import { useProjects } from "./use-projects";

export default function Command() {
  const { projects, isLoading, updateProjects } = useProjects();

  return (
    <List isLoading={isLoading}>
      {projects?.map((project) => (
        <List.Item
          key={project.id}
          icon={Icon.Bird}
          title={project.name}
          subtitle={project.id}
          actions={
            <ActionPanel>
              <Action.Push title="Search Google Cloud Services" target={<ServiceList projectId={project.id} />} />
            </ActionPanel>
          }
        />
      ))}
      <List.Item
        icon={Icon.Bird}
        title="Update Google Cloud projects"
        actions={
          <ActionPanel>
            <Action title="Update" onAction={updateProjects} />
          </ActionPanel>
        }
      />
    </List>
  );
}

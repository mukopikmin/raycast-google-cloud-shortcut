import { ActionPanel, Action, Icon, List } from "@raycast/api";
import { ServiceList } from "../service/service-list";
import { useProjects } from "./use-projects";

export const ProjectList = () => {
  const { projects, isLoading, updateProjects } = useProjects();

  return (
    <List isLoading={isLoading}>
      {projects?.map((project) => (
        <List.Item
          key={project.id}
          icon={Icon.Cloud}
          title={project.name}
          subtitle={project.id}
          actions={
            <ActionPanel>
              <Action.Push title="Show Google Cloud Services" target={<ServiceList projectId={project.id} />} />
            </ActionPanel>
          }
        />
      ))}
      <List.Item
        icon={Icon.CircleProgress}
        title={isLoading ? "Updating Projects ..." : "Update Projects"}
        actions={
          <ActionPanel>
            <Action title="Update Projects" onAction={updateProjects} />
          </ActionPanel>
        }
      />
    </List>
  );
};

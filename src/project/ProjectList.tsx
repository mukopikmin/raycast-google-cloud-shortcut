import { ActionPanel, Action, Icon, List } from "@raycast/api";
import { ServiceList } from "../service/ServiceList";
import { useProjects } from "./useProjects";

export const ProjectList = () => {
  const { projects, isLoading } = useProjects();

  return (
    <List isLoading={isLoading}>
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
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
};

import { ActionPanel, Action, Icon, List } from "@raycast/api";
import { ServiceList } from "../service/service-list";
import { useProjects } from "./use-projects";

export const ProjectList = () => {
  const { projects, isLoading, updateProjects } = useProjects();

  return (
    <List isLoading={isLoading}>
      {projects?.map((project) => (
        <ProjectListItem key={project.id} project={project} />
      ))}
      <ProjectUpdateItem isLoading={isLoading} onUpdate={updateProjects} />
    </List>
  );
};

type ProjectListItemProps = {
  project: {
    id: string;
    name: string;
  };
};

const ProjectListItem = (props: ProjectListItemProps) => {
  return (
    <List.Item
      key={props.project.id}
      id={props.project.id}
      icon={Icon.Cloud}
      title={props.project.name}
      subtitle={props.project.id}
      actions={
        <ActionPanel>
          <Action.Push title="Show Google Cloud Services" target={<ServiceList projectId={props.project.id} />} />
        </ActionPanel>
      }
    />
  );
};

type ProjectUpdateItemProps = {
  isLoading: boolean;
  onUpdate: () => void;
};

const ProjectUpdateItem = (props: ProjectUpdateItemProps) => {
  return (
    <List.Item
      icon={Icon.CircleProgress}
      title={props.isLoading ? "Updating Projects ..." : "Update Projects"}
      actions={
        <ActionPanel>
          <Action title="Update Projects" onAction={props.onUpdate} />
        </ActionPanel>
      }
    />
  );
};

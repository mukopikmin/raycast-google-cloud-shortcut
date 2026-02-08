import { ActionPanel, Action, Icon, List } from "@raycast/api";
import { useEffect, useState } from "react";
import { ServiceList } from "./service-list";
import { listCachedProjects, Project, updateProjects } from "./project";

export default function Command() {
  const [projects, setProjects] = useState<Project[] | undefined>();

  useEffect(() => {
    const fetch = async () => {
      const cachedProjects = await listCachedProjects();

      if (cachedProjects === undefined) {
        updateProjects(setProjects);
      } else {
        setProjects(cachedProjects);
      }
    };

    fetch();
  }, []);

  return (
    <List isLoading={projects === undefined}>
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
            <Action title="Update" onAction={() => updateProjects(setProjects)} />
          </ActionPanel>
        }
      />
    </List>
  );
}

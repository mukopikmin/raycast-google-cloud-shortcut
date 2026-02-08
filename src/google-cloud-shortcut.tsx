import { ActionPanel, Action, Icon, List } from "@raycast/api";
import { useEffect, useState } from "react";
import { ProjectsClient } from "@google-cloud/resource-manager";
import { LocalStorage } from "@raycast/api";
import { ServiceList } from "./service-list";

async function listProjects() {
  const client = new ProjectsClient();

  const projects: Project[] = [];
  const iterable = client.searchProjectsAsync({});

  for await (const project of iterable) {
    projects.push({
      id: project.projectId ?? "",
      name: project.displayName ?? "",
    });
  }

  return projects;
}

const CACHE_KEY_PROJECTS = "projects";

async function listCachedProjects() {
  const cachedProjects = await LocalStorage.getItem<string>(CACHE_KEY_PROJECTS);

  if (cachedProjects === undefined) {
    return undefined;
  }

  return JSON.parse(cachedProjects) as Project[];
}

async function cacheProjects(projects: Project[]) {
  await LocalStorage.setItem(CACHE_KEY_PROJECTS, JSON.stringify(projects));
}

async function updateProjects(callback: (projects: Project[]) => void) {
  const fetchedProjects = await listProjects();
  cacheProjects(fetchedProjects);
  callback(fetchedProjects);
}

type Project = {
  id: string;
  name: string;
};

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

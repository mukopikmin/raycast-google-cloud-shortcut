import { ActionPanel, Action, Icon, List } from "@raycast/api";
import { useState } from "react";
import { useGoogleApi, withGoogleAccessToken } from "../../auth/google";
import { ErrorDetail } from "../../components/ErrorDetail";
import { ServiceList } from "../../service/ServiceList";
import { useProjects, UseProjectsResult } from "./useProjects";

type ProjectListContentProps = UseProjectsResult & {
  onRefresh: () => void | Promise<void>;
};

const ProjectListContent = ({ projects, isLoading, error, onRefresh }: ProjectListContentProps) => {
  if (error) {
    return <ErrorDetail error={error} />;
  }

  return (
    <List isLoading={isLoading}>
      <List.EmptyView
        title="No Projects"
        actions={
          <ActionPanel>
            <Action title="Refresh Projects" icon={Icon.ArrowClockwise} onAction={onRefresh} />
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
              <Action title="Refresh Projects" icon={Icon.ArrowClockwise} onAction={onRefresh} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
};

const AuthenticatedProjectListComponent = () => {
  const { accessToken } = useGoogleApi();
  const projectsResult = useProjects({ accessToken, skipCache: true });

  return <ProjectListContent {...projectsResult} onRefresh={projectsResult.refreshProjects} />;
};

const AuthenticatedProjectList = withGoogleAccessToken(AuthenticatedProjectListComponent);

export const ProjectList = () => {
  const [authenticationRequested, setAuthenticationRequested] = useState(false);
  const projectsResult = useProjects();

  if (authenticationRequested || projectsResult.requiresAuthentication) {
    return <AuthenticatedProjectList />;
  }

  return <ProjectListContent {...projectsResult} onRefresh={() => setAuthenticationRequested(true)} />;
};

import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { ErrorDetail } from "../components/ErrorDetail";
import { useArtifactRegistry } from "./useArtifactRegistry";

type Props = {
  projectId: string;
};

export const ArtifactRegistryRepositoryList = ({ projectId }: Props) => {
  const { repositories, isLoading, error } = useArtifactRegistry(projectId);

  if (error) {
    return <ErrorDetail error={error} />;
  }

  return (
    <List isLoading={isLoading}>
      {repositories?.map((repo) => (
        <List.Item
          key={`${repo.location}/${repo.name}`}
          id={`${repo.location}/${repo.name}`}
          title={repo.name}
          subtitle={`${repo.location} • ${repo.format}`}
          icon={Icon.Box}
          accessories={repo.description ? [{ text: repo.description }] : []}
          actions={
            <ActionPanel>
              <Action.OpenInBrowser url={repo.url} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
};

import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { ErrorDetail } from "../components/ErrorDetail";
import { useArtifactRegistry } from "./useArtifactRegistry";

type Props = {
  projectId: string;
  locationId: string;
};

export const ArtifactRegistryRepositoryList = ({ projectId, locationId }: Props) => {
  const { repositories, isLoading, error } = useArtifactRegistry(projectId, locationId);

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
          subtitle={repo.description || undefined}
          icon={Icon.Box}
          accessories={[{ text: repo.location }, { text: repo.format }]}
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

import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { useSecretManager } from "./useSecretManager";
import { ErrorDetail } from "../components/ErrorDetail";

type Props = {
  projectId: string;
};

export const SecretManagerList = (props: Props) => {
  const { secrets, isLoading, error } = useSecretManager(props.projectId);

  if (error) {
    return <ErrorDetail error={error} />;
  }

  return (
    <List isLoading={isLoading}>
      {secrets?.map((secret) => (
        <List.Item
          key={secret.id}
          id={secret.id}
          title={secret.name}
          icon={Icon.Box}
          actions={
            <ActionPanel>
              <Action.OpenInBrowser url={secret.url} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
};

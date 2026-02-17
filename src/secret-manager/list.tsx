import { List } from "@raycast/api";
import { useSecretManager } from "./use-secret-manager";

type Props = {
  projectId: string;
};

export const SecretManagerList = (props: Props) => {
  const { secrets, isLoading } = useSecretManager(props.projectId);

  return (
    <List isLoading={isLoading}>
      {secrets?.map((secret) => (
        <List.Item key={secret.id} id={secret.id} title={secret.name} />
      ))}
    </List>
  );
};

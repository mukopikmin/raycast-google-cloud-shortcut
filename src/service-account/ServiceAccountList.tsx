import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { useServiceAccounts } from "./useServiceAccounts";

type Props = {
  projectId: string;
};

export const ServiceAccountList = (props: Props) => {
  const { serviceAccounts, isLoading } = useServiceAccounts(props.projectId);

  return (
    <List isLoading={isLoading}>
      {serviceAccounts?.map((serviceAccount) => (
        <List.Item
          key={serviceAccount.id}
          id={serviceAccount.id}
          title={serviceAccount.name}
          subtitle={serviceAccount.email}
          icon={Icon.Box}
          actions={
            <ActionPanel>
              <Action.OpenInBrowser url={serviceAccount.url} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
};

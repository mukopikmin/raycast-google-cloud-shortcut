import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { useServiceAccounts } from "./useServiceAccounts";
import { ErrorDetail } from "../../components/ErrorDetail";
import { withGoogleAccessToken } from "../../auth/google";

type Props = {
  projectId: string;
};

const ServiceAccountListComponent = (props: Props) => {
  const { serviceAccounts, isLoading, error } = useServiceAccounts(props.projectId);

  if (error) {
    return <ErrorDetail error={error} />;
  }

  return (
    <List isLoading={isLoading}>
      {serviceAccounts?.map((serviceAccount) => (
        <List.Item
          key={serviceAccount.id}
          id={serviceAccount.id}
          title={serviceAccount.name}
          subtitle={serviceAccount.email}
          keywords={serviceAccount.keywords}
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

export const ServiceAccountList = withGoogleAccessToken(ServiceAccountListComponent);

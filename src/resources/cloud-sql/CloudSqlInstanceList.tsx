import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { useCloudSqlInstances } from "./useCloudSqlInstances";
import { ErrorDetail } from "../../components/ErrorDetail";
import { OpenCloudLoggingAction } from "../../actions/cloud-logging/OpenCloudLoggingAction";
import { withGoogleAccessToken } from "../../auth/google";

type Props = {
  projectId: string;
};

const CloudSqlInstanceListComponent = (props: Props) => {
  const { cloudSqlInstances, isLoading, error } = useCloudSqlInstances(props.projectId);

  if (error) {
    return <ErrorDetail error={error} />;
  }

  return (
    <List isLoading={isLoading}>
      {cloudSqlInstances?.map((instance) => (
        <List.Item
          key={instance.id}
          id={instance.id}
          icon={Icon.Box}
          title={instance.id}
          accessories={[{ text: instance.region }, { text: instance.state }].filter((a) => a.text)}
          actions={
            <ActionPanel>
              <Action.OpenInBrowser url={instance.url} />
              <OpenCloudLoggingAction target={instance} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
};

export const CloudSqlInstanceList = withGoogleAccessToken(CloudSqlInstanceListComponent);

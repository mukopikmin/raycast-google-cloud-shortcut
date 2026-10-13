import { useState } from "react";
import { PaginatedResourceList } from "../../components/PaginatedResourceList";
import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { OpenCloudLoggingAction } from "../../actions/cloud-logging/OpenCloudLoggingAction";
import { useSecretManager } from "./useSecretManager";
import { ErrorDetail } from "../../components/ErrorDetail";
import { withGoogleAccessToken } from "../../auth/google";

type Props = {
  projectId: string;
};

const SecretManagerListComponent = (props: Props) => {
  const [searchText, setSearchText] = useState("");
  const { secrets, error, ...pagination } = useSecretManager(props.projectId, searchText);

  if (error) {
    return <ErrorDetail error={error} />;
  }

  return (
    <PaginatedResourceList
      projectId={props.projectId}
      searchText={searchText}
      onSearchTextChange={setSearchText}
      {...pagination}
      resourceName="Secrets"
      loadedCount={secrets.length}
    >
      {(loadMoreAction) =>
        secrets.map((secret) => (
          <List.Item
            key={secret.id}
            id={secret.id}
            title={secret.name}
            icon={Icon.Box}
            actions={
              <ActionPanel>
                <Action.OpenInBrowser url={secret.url} />
                <OpenCloudLoggingAction target={secret} />
                {loadMoreAction}
              </ActionPanel>
            }
          />
        ))
      }
    </PaginatedResourceList>
  );
};

export const SecretManagerList = withGoogleAccessToken(SecretManagerListComponent);

import { useState } from "react";
import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { withGoogleAccessToken } from "../../auth/google";
import { ErrorDetail } from "../../components/ErrorDetail";
import { PaginatedResourceList } from "../../components/PaginatedResourceList";
import { useApiGateways } from "./useApiGateways";

type Props = { projectId: string };

const ApiGatewayListComponent = ({ projectId }: Props) => {
  const [searchText, setSearchText] = useState("");
  const { gateways, error, ...pagination } = useApiGateways(projectId, searchText);

  if (error) return <ErrorDetail error={error} />;

  return (
    <PaginatedResourceList
      {...pagination}
      projectId={projectId}
      resourceName="Gateways"
      loadedCount={gateways.length}
      searchText={searchText}
      onSearchTextChange={setSearchText}
    >
      {(loadMoreAction) =>
        gateways.map((gateway) => (
          <List.Item
            key={gateway.id}
            id={gateway.id}
            title={gateway.name}
            subtitle={gateway.displayName}
            icon={Icon.Box}
            accessories={[{ text: gateway.region }, { text: gateway.state }].filter((a) => a.text)}
            actions={
              <ActionPanel>
                <Action.OpenInBrowser url={gateway.url} />
                {loadMoreAction}
              </ActionPanel>
            }
          />
        ))
      }
    </PaginatedResourceList>
  );
};

export const ApiGatewayList = withGoogleAccessToken(ApiGatewayListComponent);

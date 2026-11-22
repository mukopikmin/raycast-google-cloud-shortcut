import { useState } from "react";
import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { withGoogleAccessToken } from "../../auth/google";
import { ErrorDetail } from "../../components/ErrorDetail";
import { PaginatedResourceList } from "../../components/PaginatedResourceList";
import { useApiGateways } from "./useApiGateways";

const ApiGatewayListComponent = ({ projectId }: { projectId: string }) => {
  const [searchText, setSearchText] = useState("");
  const { gateways, error, unreachable, ...pagination } = useApiGateways(projectId, searchText);

  if (error) return <ErrorDetail error={error} />;

  return (
    <PaginatedResourceList
      projectId={projectId}
      resourceName="Gateways"
      loadedCount={gateways.length}
      searchText={searchText}
      onSearchTextChange={setSearchText}
      {...pagination}
    >
      {(loadMoreAction) => (
        <>
          {unreachable && unreachable.length > 0 && (
            <List.Item
              id="unreachable-gateway-regions"
              title="Some API Gateway Regions Are Unavailable"
              subtitle={unreachable.join(", ")}
              icon={Icon.ExclamationMark}
            />
          )}
          {gateways.map((gateway) => (
            <List.Item
              key={gateway.id}
              id={gateway.id}
              title={gateway.name}
              subtitle={gateway.displayName}
              icon={Icon.Box}
              accessories={[{ text: gateway.region }, { text: gateway.state }].filter((item) => item.text)}
              actions={
                <ActionPanel>
                  <Action.OpenInBrowser url={gateway.url} />
                  {gateway.defaultHostname && (
                    <Action.CopyToClipboard title="Copy Gateway Hostname" content={gateway.defaultHostname} />
                  )}
                  {loadMoreAction}
                </ActionPanel>
              }
            />
          ))}
        </>
      )}
    </PaginatedResourceList>
  );
};

export const ApiGatewayList = withGoogleAccessToken(ApiGatewayListComponent);

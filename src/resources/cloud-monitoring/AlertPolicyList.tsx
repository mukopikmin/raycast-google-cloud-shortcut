import { useState } from "react";
import { PaginatedResourceList } from "../../components/PaginatedResourceList";
import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { ErrorDetail } from "../../components/ErrorDetail";
import { useAlertPolicies } from "./useAlertPolicies";
import { withGoogleAccessToken } from "../../auth/google";

type Props = {
  projectId: string;
};

const AlertPolicyListComponent = ({ projectId }: Props) => {
  const [searchText, setSearchText] = useState("");
  const { alertPolicies, error, ...pagination } = useAlertPolicies(projectId, searchText);

  if (error) {
    return <ErrorDetail error={error} />;
  }

  return (
    <PaginatedResourceList
      searchText={searchText}
      onSearchTextChange={setSearchText}
      {...pagination}
      resourceName="Alert Policies"
      loadedCount={alertPolicies.length}
    >
      {(loadMoreAction) =>
        alertPolicies.map((policy) => (
          <List.Item
            key={policy.id}
            id={policy.id}
            title={policy.displayName}
            subtitle={policy.id}
            icon={Icon.Box}
            keywords={policy.keywords}
            accessories={[
              { text: policy.enabled === undefined ? undefined : policy.enabled ? "Enabled" : "Disabled" },
              { text: policy.severity && policy.severity !== "SEVERITY_UNSPECIFIED" ? policy.severity : undefined },
              { text: `${policy.conditionCount} condition${policy.conditionCount === 1 ? "" : "s"}` },
            ].filter((accessory) => accessory.text)}
            actions={
              <ActionPanel>
                <Action.OpenInBrowser url={policy.url} />
                <Action.CopyToClipboard title="Copy Alert Policy ID" content={policy.id} />
                {loadMoreAction}
              </ActionPanel>
            }
          />
        ))
      }
    </PaginatedResourceList>
  );
};

export const AlertPolicyList = withGoogleAccessToken(AlertPolicyListComponent);

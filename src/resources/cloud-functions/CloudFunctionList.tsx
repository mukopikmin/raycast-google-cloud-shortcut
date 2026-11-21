import { useState } from "react";
import { PaginatedResourceList } from "../../components/PaginatedResourceList";
import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { OpenCloudLoggingAction } from "../../actions/cloud-logging/OpenCloudLoggingAction";
import { ErrorDetail } from "../../components/ErrorDetail";
import { useCloudFunctions } from "./useCloudFunctions";
import { withGoogleAccessToken } from "../../auth/google";

type Props = {
  projectId: string;
};

const CloudFunctionListComponent = ({ projectId }: Props) => {
  const [searchText, setSearchText] = useState("");
  const { functions, error, ...pagination } = useCloudFunctions(projectId, searchText);

  if (error) {
    return <ErrorDetail error={error} />;
  }

  return (
    <PaginatedResourceList
      searchText={searchText}
      onSearchTextChange={setSearchText}
      {...pagination}
      resourceName="Functions"
      loadedCount={functions.length}
    >
      {(loadMoreAction) =>
        functions.map((cloudFunction) => (
          <List.Item
            key={cloudFunction.id}
            id={cloudFunction.id}
            title={cloudFunction.name}
            icon={Icon.Box}
            keywords={cloudFunction.keywords}
            accessories={[
              { text: cloudFunction.region },
              { text: cloudFunction.runtime },
              { text: cloudFunction.status },
            ].filter((a) => a.text)}
            actions={
              <ActionPanel>
                <Action.OpenInBrowser url={cloudFunction.url} />
                <OpenCloudLoggingAction target={cloudFunction} />
                {loadMoreAction}
              </ActionPanel>
            }
          />
        ))
      }
    </PaginatedResourceList>
  );
};

export const CloudFunctionList = withGoogleAccessToken(CloudFunctionListComponent);

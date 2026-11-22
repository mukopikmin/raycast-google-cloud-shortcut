import { useState } from "react";
import { PaginatedResourceList } from "../../components/PaginatedResourceList";
import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { usePubSubResources } from "./usePubSubResources";
import { ErrorDetail } from "../../components/ErrorDetail";
import { withGoogleAccessToken } from "../../auth/google";

type Props = {
  projectId: string;
};

const PubSubSubscriptionListComponent = (props: Props) => {
  const [searchText, setSearchText] = useState("");
  const { resources, error, ...pagination } = usePubSubResources(props.projectId, searchText);

  if (error) {
    return <ErrorDetail error={error} />;
  }

  return (
    <PaginatedResourceList
      searchText={searchText}
      onSearchTextChange={setSearchText}
      {...pagination}
      resourceName="Pub/Sub Resources"
      loadedCount={resources?.length ?? 0}
    >
      {(loadMoreAction) =>
        resources?.map((resource) => (
          <List.Item
            key={`${resource.resourceType}/${resource.name}`}
            id={`${resource.resourceType}/${resource.name}`}
            title={resource.name}
            icon={Icon.Box}
            keywords={resource.keywords}
            accessories={[
              {
                text:
                  resource.resourceType === "Subscription"
                    ? `${resource.resourceType} / ${resource.subscriptionType}`
                    : resource.resourceType,
              },
            ].filter((a) => a.text)}
            actions={
              <ActionPanel>
                <Action.OpenInBrowser url={resource.url} />
                {loadMoreAction}
              </ActionPanel>
            }
          />
        ))
      }
    </PaginatedResourceList>
  );
};

export const PubSubSubscriptionList = withGoogleAccessToken(PubSubSubscriptionListComponent);

import { useState } from "react";
import { PaginatedResourceList } from "../../components/PaginatedResourceList";
import { ActionPanel, Action, Icon, List } from "@raycast/api";
import { useKubernetesEngineClusters } from "./useKubernetesEngineClusters";
import { ErrorDetail } from "../../components/ErrorDetail";
import { withGoogleAccessToken } from "../../auth/google";
import { createKubernetesEngineClusterUrl } from "./types";

type Props = {
  projectId: string;
};

const KubernetesEngineClusterListComponent = ({ projectId }: Props) => {
  const [searchText, setSearchText] = useState("");
  const { clusters, error, ...pagination } = useKubernetesEngineClusters(projectId, searchText);

  if (error) {
    return <ErrorDetail error={error} />;
  }

  return (
    <PaginatedResourceList
      searchText={searchText}
      onSearchTextChange={setSearchText}
      {...pagination}
      resourceName="Kubernetes Engine Clusters"
      loadedCount={clusters.length}
    >
      {(loadMoreAction) =>
        clusters.map((cluster) => (
          <List.Item
            key={cluster.id}
            title={cluster.name}
            subtitle={cluster.endpoint}
            icon={Icon.Network}
            accessories={[
              { text: cluster.location, tooltip: "Location" },
              { text: cluster.status, tooltip: "Status" },
              { text: cluster.version, tooltip: "Master Version" },
              { text: `${cluster.nodeCount} nodes`, tooltip: "Node Count" },
            ].filter((a) => a.text)}
            actions={
              <ActionPanel>
                <Action.OpenInBrowser title="Open in Cloud Console" url={createKubernetesEngineClusterUrl(cluster)} />
                <Action.CopyToClipboard title="Copy Cluster Name" content={cluster.name} />
                {cluster.endpoint && <Action.CopyToClipboard title="Copy Endpoint" content={cluster.endpoint} />}
                {loadMoreAction}
              </ActionPanel>
            }
          />
        ))
      }
    </PaginatedResourceList>
  );
};

export const KubernetesEngineClusterList = withGoogleAccessToken(KubernetesEngineClusterListComponent);

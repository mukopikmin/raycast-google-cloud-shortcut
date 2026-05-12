import { ActionPanel, Action, Icon, List } from "@raycast/api";
import { useKubernetesEngineClusters } from "./useKubernetesEngineClusters";
import { ErrorDetail } from "../components/ErrorDetail";

type Props = {
  projectId: string;
};

export const KubernetesEngineClusterList = ({ projectId }: Props) => {
  const { clusters, isLoading, error } = useKubernetesEngineClusters(projectId);

  if (error) {
    return <ErrorDetail error={error} />;
  }

  return (
    <List isLoading={isLoading} searchBarPlaceholder="Search Kubernetes Engine clusters...">
      {clusters?.map((cluster) => (
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
              <Action.OpenInBrowser
                title="Open in Cloud Console"
                url={`https://console.cloud.google.com/kubernetes/clusters/details/${cluster.location}/${cluster.name}/details?project=${projectId}`}
              />
              <Action.CopyToClipboard title="Copy Cluster Name" content={cluster.name} />
              {cluster.endpoint && <Action.CopyToClipboard title="Copy Endpoint" content={cluster.endpoint} />}
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
};

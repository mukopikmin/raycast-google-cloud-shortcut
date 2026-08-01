import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { useAlloyDbClusters } from "./useAlloyDbClusters";
import { ErrorDetail } from "../../components/ErrorDetail";
import { OpenCloudLoggingAction } from "../../actions/cloud-logging/OpenCloudLoggingAction";
import { withGoogleAccessToken } from "../../auth/google";

type Props = {
  projectId: string;
};

const AlloyDbClusterListComponent = (props: Props) => {
  const { clusters, isLoading, error } = useAlloyDbClusters(props.projectId);

  if (error) {
    return <ErrorDetail error={error} />;
  }

  return (
    <List isLoading={isLoading}>
      {clusters?.map((cluster) => (
        <List.Item
          key={cluster.id}
          id={cluster.id}
          icon={Icon.Box}
          title={cluster.name}
          accessories={[
            { text: cluster.clusterId, tooltip: "Cluster ID" },
            { text: cluster.region, tooltip: "Region" },
            { text: cluster.state, tooltip: "State" },
          ].filter((a) => a.text)}
          actions={
            <ActionPanel>
              <Action.OpenInBrowser url={cluster.url} />
              <OpenCloudLoggingAction target={cluster} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
};

export const AlloyDbClusterList = withGoogleAccessToken(AlloyDbClusterListComponent);

import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { usePromise } from "@raycast/utils";
import { useGoogleApi } from "../auth/google";
import { listCloudSchedulerLocations } from "./api";
import { CloudSchedulerJobList } from "./CloudSchedulerJobList";
import { ErrorDetail } from "../components/ErrorDetail";

type Props = {
  projectId: string;
};

export const CloudSchedulerRegionList = ({ projectId }: Props) => {
  const { accessToken } = useGoogleApi();
  const {
    data: locations,
    isLoading,
    error,
  } = usePromise(
    async (projId: string, token: string) => {
      return await listCloudSchedulerLocations(projId, token);
    },
    [projectId, accessToken],
  );

  if (error) {
    return <ErrorDetail error={error} />;
  }

  return (
    <List isLoading={isLoading}>
      {locations?.map((location) => (
        <List.Item
          key={location.id}
          id={location.id}
          title={location.name}
          subtitle={location.id}
          icon={Icon.Map}
          actions={
            <ActionPanel>
              <Action.Push
                title={`Show Resources in ${location.id}`}
                target={<CloudSchedulerJobList projectId={projectId} locationId={location.id} />}
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
};

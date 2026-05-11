import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { usePromise } from "@raycast/utils";
import { useGoogleApi } from "../auth/google";
import { ErrorDetail } from "../components/ErrorDetail";
import { Location } from "./types";

type Props = {
  projectId: string;
  fetchLocations: (projectId: string, accessToken: string) => Promise<Location[]>;
  target: (args: { projectId: string; locationId: string }) => React.ReactNode;
};

export const RegionList = (props: Props) => {
  const { accessToken } = useGoogleApi();
  const {
    data: regions,
    isLoading,
    error,
  } = usePromise(
    async (projId: string, token: string) => {
      return await props.fetchLocations(projId, token);
    },
    [props.projectId, accessToken],
  );

  if (error) {
    return <ErrorDetail error={error} />;
  }

  return (
    <List isLoading={isLoading}>
      {regions?.map((region) => (
        <List.Item
          key={region.id}
          id={region.id}
          title={region.name}
          subtitle={region.id}
          icon={Icon.Map}
          actions={
            <ActionPanel>
              <Action.Push
                title={`Show Resources in ${region.id}`}
                target={props.target({ projectId: props.projectId, locationId: region.id })}
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
};

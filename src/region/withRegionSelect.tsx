import { RegionList } from "./RegionList";
import { Action } from "@raycast/api";
import { Location } from "./types";

type Props = {
  projectId: string;
  title: string;
  target: React.ComponentType<{ projectId: string; locationId: string }>;
  fetchLocations: (projectId: string, accessToken: string) => Promise<Location[]>;
};

export const withRegionSelect = (props: Props) => {
  return (
    <Action.Push
      title={props.title}
      target={
        <RegionList
          projectId={props.projectId}
          fetchLocations={props.fetchLocations}
          target={(args: { projectId: string; locationId: string }) => (
            <props.target projectId={args.projectId} locationId={args.locationId} />
          )}
        />
      }
    />
  );
};

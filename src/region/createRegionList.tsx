import { RegionList } from "./RegionList";
import { Location } from "./types";

type Props = {
  projectId: string;
  target: React.ComponentType<{ projectId: string; locationId: string }>;
  fetchLocations: (projectId: string, accessToken: string) => Promise<Location[]>;
};

export const createRegionList = (props: Props) => {
  return (
    <RegionList
      projectId={props.projectId}
      fetchLocations={props.fetchLocations}
      target={(args: { projectId: string; locationId: string }) => (
        <props.target projectId={args.projectId} locationId={args.locationId} />
      )}
    />
  );
};

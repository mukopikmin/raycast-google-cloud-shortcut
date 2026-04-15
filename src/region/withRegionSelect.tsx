import { RegionList } from "./RegionList";
import { Action } from "@raycast/api";

type Props = {
  projectId: string;
  title: string;
  target: React.ComponentType<{ projectId: string; locationId: string }>;
  includeMultiRegions?: boolean;
};

export const withRegionSelect = (props: Props) => {
  return (
    <Action.Push
      title={props.title}
      target={
        <RegionList
          projectId={props.projectId}
          includeMultiRegions={props.includeMultiRegions}
          target={(args) => <props.target projectId={args.projectId} locationId={args.locationId} />}
        />
      }
    />
  );
};

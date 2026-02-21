import { RegionList } from "./RegionList";
import { Action } from "@raycast/api";

type Props = {
  projectId: string;
  title: string;
  target: React.ComponentType<{ projectId: string; locationId: string }>;
};

export const withRegionSelect = (props: Props) => {
  return (
    <Action.Push
      title={props.title}
      target={
        <RegionList
          projectId={props.projectId}
          target={(args) => <props.target projectId={args.projectId} locationId={args.locationId} />}
        />
      }
    />
  );
};

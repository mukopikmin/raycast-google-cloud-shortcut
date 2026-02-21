import { CloudSchedulerJobList } from "./CloudSchedulerJobList";
import { RegionList } from "../region/RegionList";

type Props = {
  projectId: string;
};

export const CloudSchedulerRegionList = (props: Props) => {
  return (
    <RegionList
      projectId={props.projectId}
      target={(args) => <CloudSchedulerJobList projectId={args.projectId} locationId={args.locationId} />}
    />
  );
};

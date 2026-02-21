import { CloudTasksQueueList } from "./CloudTasksQueueList";
import { RegionList } from "../region/RegionList";

type Props = {
  projectId: string;
};

export const CloudTasksRegionList = (props: Props) => {
  return (
    <RegionList
      projectId={props.projectId}
      target={(args) => <CloudTasksQueueList projectId={args.projectId} locationId={args.locationId} />}
    />
  );
};

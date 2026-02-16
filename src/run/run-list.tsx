import { Icon, List } from "@raycast/api";
import { useRuns } from "./use-runs";

type Props = {
  projectId: string;
};

export const RunList = (props: Props) => {
  const { runs, isLoading } = useRuns(props.projectId);

  return (
    <List isLoading={isLoading}>
      {runs?.map((run) => (
        <List.Item key={run.id} id={run.id} icon={Icon.ComputerChip} title={run.name} subtitle={run.region} />
      ))}
    </List>
  );
};

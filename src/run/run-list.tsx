import { Icon, List } from "@raycast/api";
import { useEffect, useState } from "react";
import { listCloudRuns, Run } from "./run";

type Props = {
  projectId: string;
};

export const RunList = (props: Props) => {
  const { runs, isLoading } = useRuns(props.projectId);

  return (
    <List isLoading={isLoading}>
      {runs?.map((run) => (
        <List.Item key={run.name} icon={Icon.ComputerChip} title={run.name} subtitle={run.region} />
      ))}
    </List>
  );
};

type UseRunsResult =
  | {
      runs: Run[];
      isLoading: false;
      error: undefined;
    }
  | {
      runs: undefined;
      isLoading: true;
      error: undefined;
    };

const useRuns = (projectId: string): UseRunsResult => {
  const [runs, setRuns] = useState<Run[] | undefined>(undefined);

  useEffect(() => {
    const fetch = async () => {
      const fetchedRuns = await listCloudRuns(projectId);
      setRuns(fetchedRuns);
    };

    fetch();
  }, [projectId]);

  return runs === undefined
    ? {
        runs: undefined,
        isLoading: true,
        error: undefined,
      }
    : {
        runs,
        isLoading: false,
        error: undefined,
      };
};

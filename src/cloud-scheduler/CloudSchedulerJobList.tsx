import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { useCloudSchedulerJobs } from "./useCloudSchedulerJobs";
import { toReadableCron } from "./cron";

type Props = { projectId: string; locationId: string };

export const CloudSchedulerJobList = ({ projectId, locationId }: Props) => {
  const { scheduledJobs, isLoading } = useCloudSchedulerJobs(projectId, locationId);

  return (
    <List isLoading={isLoading}>
      {scheduledJobs?.map((schedulerJob) => (
        <List.Item
          key={schedulerJob.name}
          id={schedulerJob.name}
          icon={Icon.Box}
          title={schedulerJob.name}
          subtitle={`${toReadableCron(schedulerJob.schedule)} (${schedulerJob.timeZone})`}
          actions={
            <ActionPanel>
              <Action.OpenInBrowser url={schedulerJob.url} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
};

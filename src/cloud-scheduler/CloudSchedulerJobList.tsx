import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { useCloudSchedulerJobs } from "./useCloudSchedulerJobs";
import { toReadableCron } from "./cron";
import { ErrorDetail } from "../components/ErrorDetail";

type Props = { projectId: string; locationId: string };

export const CloudSchedulerJobList = ({ projectId, locationId }: Props) => {
  const { scheduledJobs, isLoading, error } = useCloudSchedulerJobs(projectId, locationId);

  if (error) {
    return <ErrorDetail error={error} />;
  }

  return (
    <List isLoading={isLoading}>
      {scheduledJobs?.map((schedulerJob) => (
        <List.Item
          key={schedulerJob.name}
          id={schedulerJob.name}
          icon={Icon.Box}
          title={schedulerJob.name}
          subtitle={toReadableCron(schedulerJob.schedule)}
          accessories={[{ text: schedulerJob.timeZone }]}
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

import { PaginatedResourceList } from "../../components/PaginatedResourceList";
import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { useCloudSchedulerJobs } from "./useCloudSchedulerJobs";
import { toReadableCron } from "./cron";
import { ErrorDetail } from "../../components/ErrorDetail";
import { withGoogleAccessToken } from "../../auth/google";

type Props = { projectId: string; locationId: string };

const CloudSchedulerJobListComponent = ({ projectId, locationId }: Props) => {
  const { scheduledJobs, error, ...pagination } = useCloudSchedulerJobs(projectId, locationId);

  if (error) {
    return <ErrorDetail error={error} />;
  }

  return (
    <PaginatedResourceList {...pagination} resourceName="Jobs" loadedCount={scheduledJobs?.length ?? 0}>
      {(loadMoreAction) =>
        scheduledJobs?.map((schedulerJob) => (
          <List.Item
            key={schedulerJob.name}
            id={schedulerJob.name}
            icon={Icon.Box}
            title={schedulerJob.name}
            subtitle={toReadableCron(schedulerJob.schedule)}
            accessories={[{ text: schedulerJob.timeZone }].filter((a) => a.text)}
            actions={
              <ActionPanel>
                <Action.OpenInBrowser url={schedulerJob.url} />
                {loadMoreAction}
              </ActionPanel>
            }
          />
        ))
      }
    </PaginatedResourceList>
  );
};

export const CloudSchedulerJobList = withGoogleAccessToken(CloudSchedulerJobListComponent);

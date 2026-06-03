import { useState } from "react";
import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { useCloudSchedulerJobs } from "./useCloudSchedulerJobs";
import { toReadableCron } from "./cron";
import { ErrorDetail } from "../components/ErrorDetail";

type Props = { projectId: string; locationId: string };

export const CloudSchedulerJobList = ({ projectId, locationId }: Props) => {
  const [searchText, setSearchText] = useState("");
  const { scheduledJobs, isLoading, isLoadingMore, hasMore, isTruncated, loadMore, error } = useCloudSchedulerJobs(
    projectId,
    locationId,
  );

  if (error) {
    return <ErrorDetail error={error} />;
  }

  const canLoadMore = hasMore && !isTruncated;
  const loadMoreAction = canLoadMore ? (
    <Action title="Load More Jobs" icon={Icon.ArrowDown} onAction={loadMore} />
  ) : undefined;

  return (
    <List
      isLoading={isLoading || isLoadingMore}
      pagination={
        canLoadMore
          ? {
              pageSize: 500,
              hasMore: canLoadMore,
              onLoadMore: () => {
                void loadMore();
              },
            }
          : undefined
      }
      filtering
      onSearchTextChange={setSearchText}
      searchBarPlaceholder="Search loaded Cloud Scheduler jobs..."
    >
      <List.EmptyView
        icon={Icon.MagnifyingGlass}
        title={searchText && canLoadMore ? "No loaded jobs match this search" : "No Cloud Scheduler jobs found"}
        description={
          searchText && canLoadMore
            ? "More jobs may exist. Load more jobs to expand the searchable set."
            : isTruncated
              ? "The Cloud Scheduler job list is truncated to keep memory usage bounded."
              : undefined
        }
        actions={loadMoreAction ? <ActionPanel>{loadMoreAction}</ActionPanel> : undefined}
      />
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
              {loadMoreAction}
            </ActionPanel>
          }
        />
      ))}
      {canLoadMore && (
        <List.Item
          id="load-more-cloud-scheduler-jobs"
          title="Load More Jobs"
          icon={Icon.ArrowDown}
          accessories={[{ text: `${scheduledJobs?.length ?? 0} loaded` }]}
          actions={<ActionPanel>{loadMoreAction}</ActionPanel>}
        />
      )}
      {isTruncated && (
        <List.Item
          id="cloud-scheduler-jobs-truncated"
          title="Cloud Scheduler Job List Truncated"
          icon={Icon.ExclamationMark}
          accessories={[{ text: `${scheduledJobs?.length ?? 0} loaded` }]}
        />
      )}
    </List>
  );
};

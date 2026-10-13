import { useState } from "react";
import { Action, Icon } from "@raycast/api";
import { withGoogleAccessToken } from "../../auth/google";
import { CloudRunDeploymentList } from "./CloudRunDeploymentList";
import { createCloudRunExecutionsUrl } from "./urls";
import { useCloudRunJobs } from "./useCloudRunJobs";

type Props = { projectId: string };

const CloudRunJobsListComponent = ({ projectId }: Props) => {
  const [searchText, setSearchText] = useState("");
  const { jobs, ...result } = useCloudRunJobs(projectId, searchText);

  return (
    <CloudRunDeploymentList
      searchText={searchText}
      onSearchTextChange={setSearchText}
      {...result}
      deployments={jobs}
      resourceName="Jobs"
      secondaryAction={(job) => (
        <Action.OpenInBrowser
          title="Open Executions in Browser"
          url={createCloudRunExecutionsUrl(projectId, job.region, job.name)}
          icon={Icon.ChevronRight}
        />
      )}
    />
  );
};

export const CloudRunJobsList = withGoogleAccessToken(CloudRunJobsListComponent);

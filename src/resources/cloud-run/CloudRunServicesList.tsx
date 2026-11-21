import { useState } from "react";
import { Action, Icon } from "@raycast/api";
import { withGoogleAccessToken } from "../../auth/google";
import { CloudRunDeploymentList } from "./CloudRunDeploymentList";
import { createCloudRunRevisionsUrl } from "./urls";
import { useCloudRunServices } from "./useCloudRunServices";

type Props = { projectId: string };

const CloudRunServicesListComponent = ({ projectId }: Props) => {
  const [searchText, setSearchText] = useState("");
  const { services, ...result } = useCloudRunServices(projectId, searchText);

  return (
    <CloudRunDeploymentList
      projectId={projectId}
      searchText={searchText}
      onSearchTextChange={setSearchText}
      {...result}
      deployments={services}
      resourceName="Services"
      secondaryAction={(service) => (
        <Action.OpenInBrowser
          title="Open Revisions in Browser"
          url={createCloudRunRevisionsUrl(projectId, service.region, service.name)}
          icon={Icon.ChevronRight}
        />
      )}
    />
  );
};

export const CloudRunServicesList = withGoogleAccessToken(CloudRunServicesListComponent);

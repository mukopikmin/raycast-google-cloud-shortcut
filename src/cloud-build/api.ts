import { fetchGoogleApi } from "../auth/api";
import { CloudBuild, CloudBuildStatus, createCloudBuild } from "./types";

type CloudBuildsResponse = {
  builds?: {
    id: string;
    status: CloudBuildStatus;
    createTime: string;
    startTime?: string;
    finishTime?: string;
    buildTriggerId?: string;
    substitutions?: {
      TRIGGER_NAME?: string;
    };
  }[];
};

/**
 * @see https://cloud.google.com/build/docs/api/reference/rest/v1/projects.locations.builds/list
 */
export const listCloudBuilds = async (projectId: string, accessToken: string): Promise<CloudBuild[]> => {
  const url = `https://cloudbuild.googleapis.com/v1/projects/${projectId}/locations/global/builds`;

  const body = await fetchGoogleApi<CloudBuildsResponse>(url, accessToken);

  return (
    body.builds?.map((build) => {
      return createCloudBuild({
        id: build.id,
        projectId,
        status: build.status,
        createTime: build.createTime,
        startTime: build.startTime,
        finishTime: build.finishTime,
        triggerName: build.substitutions?.TRIGGER_NAME,
        region: "global",
      });
    }) ?? []
  );
};

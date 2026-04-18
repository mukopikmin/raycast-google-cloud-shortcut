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
 * @see https://cloud.google.com/build/docs/api/reference/rest/v1/projects.builds/list
 */
export const listCloudBuilds = async (
  projectId: string,
  accessToken: string,
  region: string,
): Promise<CloudBuild[]> => {
  const location = region === "global" ? "" : region;
  const parent = location ? `projects/${projectId}/locations/${location}` : `projects/${projectId}`;

  const url = location
    ? `https://cloudbuild.googleapis.com/v1/${parent}/builds`
    : `https://cloudbuild.googleapis.com/v1/projects/${projectId}/builds`;

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
        region: region,
      });
    }) ?? []
  );
};

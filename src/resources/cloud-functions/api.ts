import { fetchGoogleApi } from "../../auth/api";
import { CloudFunction, createCloudFunction } from "./types";

type CloudFunctionsResponse = {
  functions?: {
    name: string;
    status?: string;
    runtime?: string;
  }[];
  nextPageToken?: string;
  unreachable?: string[];
};

export type CloudFunctionsPage = {
  functions: CloudFunction[];
  nextPageToken?: string;
};

/**
 * @see https://docs.cloud.google.com/functions/docs/reference/rest/v1/projects.locations.functions/list
 */
export const listCloudFunctionsPage = async (
  projectId: string,
  accessToken: string,
  options: { pageSize: number; pageToken?: string },
): Promise<CloudFunctionsPage> => {
  const query = new URLSearchParams({
    pageSize: options.pageSize.toString(),
  });
  if (options.pageToken) {
    query.set("pageToken", options.pageToken);
  }

  const body = await fetchGoogleApi<CloudFunctionsResponse>(
    `https://cloudfunctions.googleapis.com/v1/projects/${projectId}/locations/-/functions?${query.toString()}`,
    accessToken,
  );

  return {
    functions:
      body.functions?.map((cloudFunction) => {
        const parts = cloudFunction.name.split("/");
        const region = parts[parts.length - 3];
        const name = parts[parts.length - 1];

        return createCloudFunction({
          projectId,
          id: cloudFunction.name,
          name,
          region,
          status: cloudFunction.status,
          runtime: cloudFunction.runtime,
        });
      }) ?? [],
    nextPageToken: body.nextPageToken,
  };
};

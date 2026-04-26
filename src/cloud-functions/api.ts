import { fetchGoogleApi } from "../auth/api";
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

/**
 * @see https://docs.cloud.google.com/functions/docs/reference/rest/v1/projects.locations.functions/list
 */
export const listCloudFunctions = async (projectId: string, accessToken: string): Promise<CloudFunction[]> => {
  const functions: CloudFunction[] = [];
  let pageToken: string | undefined;

  do {
    const query = new URLSearchParams();
    if (pageToken) {
      query.set("pageToken", pageToken);
    }

    const suffix = query.toString();
    const body = await fetchGoogleApi<CloudFunctionsResponse>(
      `https://cloudfunctions.googleapis.com/v1/projects/${projectId}/locations/-/functions${suffix ? `?${suffix}` : ""}`,
      accessToken,
    );

    functions.push(
      ...(body.functions?.map((cloudFunction) => {
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
      }) ?? []),
    );

    pageToken = body.nextPageToken;
  } while (pageToken);

  return functions;
};

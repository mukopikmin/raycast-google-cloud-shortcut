import { appendResourcePage, RESOURCE_LIMIT } from "../../pagination/pages";
import { CloudRunServicesPage, CloudRunServicesState } from "./types";

export const CLOUD_RUN_SERVICE_LIMIT = RESOURCE_LIMIT;

export const emptyCloudRunServicesState = (): CloudRunServicesState => ({
  services: [],
  unreachable: [],
  isTruncated: false,
});

export const appendCloudRunServicesPage = (
  state: CloudRunServicesState,
  page: CloudRunServicesPage,
): CloudRunServicesState => {
  const { resources, ...pagination } = appendResourcePage(
    { ...state, resources: state.services },
    { resources: page.deployments, nextPageToken: page.nextPageToken },
    (service) => service.id,
  );
  return {
    ...pagination,
    services: resources,
    unreachable: [...new Set([...state.unreachable, ...page.unreachable])].sort(),
  };
};

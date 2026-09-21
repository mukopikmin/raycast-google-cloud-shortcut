import { CloudRunServicesPage, CloudRunServicesState } from "./types";

export const CLOUD_RUN_SERVICE_LIMIT = 500;

export const emptyCloudRunServicesState = (): CloudRunServicesState => ({
  services: [],
  unreachable: [],
  isTruncated: false,
});

export const appendCloudRunServicesPage = (
  state: CloudRunServicesState,
  page: CloudRunServicesPage,
): CloudRunServicesState => {
  const services = [
    ...new Map([...state.services, ...page.deployments].map((service) => [service.id, service])).values(),
  ];
  const atLimit = services.length >= CLOUD_RUN_SERVICE_LIMIT;
  return {
    services: services.slice(0, CLOUD_RUN_SERVICE_LIMIT),
    nextPageToken: atLimit ? undefined : page.nextPageToken,
    unreachable: [...new Set([...state.unreachable, ...page.unreachable])].sort(),
    isTruncated: services.length > CLOUD_RUN_SERVICE_LIMIT || (atLimit && Boolean(page.nextPageToken)),
  };
};

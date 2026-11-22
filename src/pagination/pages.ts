import { ResourcePage, ResourcePageState } from "./types";

export const RESOURCE_LIMIT = 500;
export const RESOURCE_PAGE_SIZE = RESOURCE_LIMIT;

export const emptyResourcePageState = <T>(): ResourcePageState<T> => ({ resources: [], isTruncated: false });

export const appendResourcePage = <T>(
  state: ResourcePageState<T>,
  page: ResourcePage<T>,
  getId: (resource: T) => string,
): ResourcePageState<T> => {
  const resources = [...new Map([...state.resources, ...page.resources].map((item) => [getId(item), item])).values()];
  return {
    resources: resources.slice(-RESOURCE_LIMIT),
    nextPageToken: page.nextPageToken,
    isTruncated: state.isTruncated || Boolean(page.isTruncated) || resources.length > RESOURCE_LIMIT,
    ...(state.unreachable || page.unreachable
      ? { unreachable: [...new Set([...(state.unreachable ?? []), ...(page.unreachable ?? [])])].sort() }
      : {}),
  };
};

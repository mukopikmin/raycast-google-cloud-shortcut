import { RESOURCE_LIMIT } from "./pages";
import { PageOptions, ResourcePage, ResourcePageState } from "./types";

export const normalizeSearch = (text: string) => text.normalize("NFKC").trim().toLowerCase();

export const matchesResourceSearch = (text: string, query: string) => {
  const searchable = normalizeSearch(text);
  return normalizeSearch(query)
    .split(/\s+/)
    .every((term) => searchable.includes(term));
};

export const mergeResourceSearchPages = <T>(
  pages: ResourcePage<T>[],
  query: string,
  getId: (resource: T) => string,
  getSearchText: (resource: T) => string,
  getName: (resource: T) => string = getSearchText,
): ResourcePageState<T> => {
  const normalized = normalizeSearch(query);
  const terms = normalized.split(/\s+/);
  const rank = (name: string) => {
    if (name === normalized) return 0;
    if (name.startsWith(normalized)) return 1;
    if (name.includes(normalized)) return 2;
    if (terms.every((term) => name.includes(term))) return 3;
    return 4;
  };
  const matches = [
    ...new Map(
      pages
        .flatMap((page) => page.resources)
        .filter((resource) => matchesResourceSearch(getSearchText(resource), normalized))
        .map((resource) => [getId(resource), resource]),
    ).values(),
  ];
  const ranked = matches.map((resource) => ({
    resource,
    name: normalizeSearch(getName(resource)),
    id: getId(resource),
  }));
  ranked.sort(
    (a, b) =>
      rank(a.name) - rank(b.name) ||
      a.name.length - b.name.length ||
      (a.name < b.name ? -1 : a.name > b.name ? 1 : a.id < b.id ? -1 : a.id > b.id ? 1 : 0),
  );
  const unreachable = [...new Set(pages.flatMap((page) => page.unreachable ?? []))].sort();
  return {
    resources: ranked.slice(0, RESOURCE_LIMIT).map(({ resource }) => resource),
    isTruncated: pages.some((page) => page.isTruncated) || matches.length > RESOURCE_LIMIT,
    ...(unreachable.length ? { unreachable } : {}),
  };
};

// Search all pages before ranking candidates. Stopping after the first matching
// page can hide a prefix match such as journal behind earlier substring matches.
export const collectMatchingResourcePage = async <T>(
  fetchPage: (options: PageOptions) => Promise<ResourcePage<T>>,
  options: PageOptions,
  query: string,
  getId: (resource: T) => string,
  getSearchText: (resource: T) => string,
  isCurrent: () => boolean,
  onPageChecked: () => void,
  getName: (resource: T) => string = getSearchText,
): Promise<ResourcePage<T>> => {
  let matches: ResourcePageState<T> = { resources: [], isTruncated: false };
  let pageToken = options.pageToken;
  const checkCurrent = () => {
    if (!isCurrent()) {
      const error = new Error("Search was superseded");
      error.name = "AbortError";
      throw error;
    }
  };

  for (;;) {
    checkCurrent();
    const page = await fetchPage({ ...options, pageToken });
    checkCurrent();
    if (!query) {
      onPageChecked();
      return page;
    }
    matches = mergeResourceSearchPages([matches, page], query, getId, getSearchText, getName);
    onPageChecked();
    if (!page.nextPageToken) {
      return { ...matches, nextPageToken: undefined };
    }
    if (page.nextPageToken === pageToken) {
      throw new Error("The resource API returned a repeated pagination token before the search finished.");
    }
    pageToken = page.nextPageToken;
  }
};

import { PageOptions, ResourcePage } from "./types";

export const normalizeSearch = (text: string) => text.normalize("NFKC").trim().toLowerCase();

export const matchesResourceSearch = (text: string, query: string) => {
  const searchable = normalizeSearch(text);
  return normalizeSearch(query)
    .split(/\s+/)
    .every((term) => searchable.includes(term));
};

// A search page contains matches, not arbitrary resources from the current
// window. Nonmatching API pages can be discarded as soon as they are checked.
export const collectMatchingResourcePage = async <T>(
  fetchPage: (options: PageOptions) => Promise<ResourcePage<T>>,
  options: PageOptions,
  query: string,
  getId: (resource: T) => string,
  getSearchText: (resource: T) => string,
  isCurrent: () => boolean,
  onPageChecked: () => void,
): Promise<ResourcePage<T>> => {
  const matches = new Map<string, T>();
  const unreachable = new Set<string>();
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
    for (const resource of page.resources) {
      if (!query || matchesResourceSearch(getSearchText(resource), query)) matches.set(getId(resource), resource);
    }
    page.unreachable?.forEach((region) => unreachable.add(region));
    onPageChecked();
    if (!query || matches.size >= options.pageSize || !page.nextPageToken) {
      return {
        resources: [...matches.values()],
        nextPageToken: page.nextPageToken,
        ...(unreachable.size ? { unreachable: [...unreachable].sort() } : {}),
      };
    }
    if (page.nextPageToken === pageToken) {
      throw new Error("The resource API returned a repeated pagination token before the search finished.");
    }
    pageToken = page.nextPageToken;
  }
};

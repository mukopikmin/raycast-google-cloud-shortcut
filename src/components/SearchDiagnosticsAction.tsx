import { Action } from "@raycast/api";
import { normalizeSearch } from "../pagination/search";

type Props = {
  projectId: string;
  resourceName: string;
  searchText: string;
  isLoading: boolean;
  isSearching: boolean;
  pagesSearched: number;
  resourcesSearched: number;
  displayedCount: number;
  hasMore: boolean;
  isTruncated: boolean;
  unreachable?: string[];
};

export const SearchDiagnosticsAction = (props: Props) => (
  <Action.CopyToClipboard
    title="Copy Search Diagnostics"
    content={JSON.stringify(
      {
        implementation: "all-pages-ranked-with-diagnostics",
        projectId: props.projectId,
        resource: props.resourceName,
        query: props.searchText,
        normalizedQuery: normalizeSearch(props.searchText),
        status: props.isSearching ? "searching" : props.isLoading ? "loading" : "complete",
        pagesChecked: props.pagesSearched,
        resourcesChecked: props.resourcesSearched,
        displayedResults: props.displayedCount,
        hasNextPage: props.hasMore,
        resultLimitReached: props.isTruncated,
        unavailableRegions: props.unreachable ?? [],
      },
      null,
      2,
    )}
  />
);

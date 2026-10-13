export type PageOptions = {
  pageSize: number;
  pageToken?: string;
};

export type ResourcePage<T> = {
  resources: T[];
  nextPageToken?: string;
  unreachable?: string[];
  isTruncated?: boolean;
};

export type ResourcePageState<T> = ResourcePage<T> & {
  isTruncated: boolean;
};

export type ResourcePagination = {
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  isTruncated: boolean;
  loadMore: () => Promise<void>;
  reload?: () => Promise<void>;
  isSearching?: boolean;
  pagesSearched?: number;
};

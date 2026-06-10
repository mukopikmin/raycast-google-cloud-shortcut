import { useEffect } from "react";

type Options = {
  searchText: string;
  canLoadMore: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  loadMore: () => Promise<void>;
};

export const useLoadMoreOnSearch = ({ searchText, canLoadMore, isLoading, isLoadingMore, loadMore }: Options) => {
  useEffect(() => {
    if (!searchText.trim() || !canLoadMore || isLoading || isLoadingMore) {
      return;
    }

    void loadMore();
  }, [canLoadMore, isLoading, isLoadingMore, loadMore, searchText]);
};

import { usePromise } from "@raycast/utils";
import { useGoogleApi } from "../auth/google";
import { PubSubTopic } from "./types";
import { listPubSubTopics } from "./api";

type SuccessResult = {
  topics: PubSubTopic[];
  isLoading: boolean;
  error: undefined;
};

type LoadingResult = {
  topics: undefined;
  isLoading: true;
  error: undefined;
};

type ErrorResult = {
  topics: undefined;
  isLoading: false;
  error: Error;
};

type UsePubSubTopicsResult = SuccessResult | LoadingResult | ErrorResult;

export const usePubSubTopics = (projectId: string): UsePubSubTopicsResult => {
  const { accessToken } = useGoogleApi();
  const { data, isLoading, error } = usePromise(
    async (projId: string, token: string) => {
      return await listPubSubTopics(projId, token);
    },
    [projectId, accessToken],
  );

  if (error) {
    return { topics: undefined, isLoading: false, error };
  }

  if (!data) {
    return { topics: undefined, isLoading: true, error: undefined };
  }

  return { topics: data, isLoading, error: undefined };
};

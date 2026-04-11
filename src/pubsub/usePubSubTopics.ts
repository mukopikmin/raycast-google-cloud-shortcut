import { usePromise } from "@raycast/utils";
import { useGoogleApi } from "../auth/google";
import { PubSubTopic } from "./types";
import { listPubSubTopics } from "./api";

type UsePubSubTopicsResult =
  | {
      topics: PubSubTopic[];
      isLoading: boolean;
      error: undefined;
    }
  | {
      topics: undefined;
      isLoading: true;
      error: undefined;
    }
  | {
      topics: undefined;
      isLoading: false;
      error: Error;
    };

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

import { useEffect, useState } from "react";
import { useGoogleApi } from "../auth/google";
import { PubSubTopic } from "./types";
import { listPubSubTopics } from "./api";

type UsePubSubTopicsResult =
  | {
      topics: PubSubTopic[];
      isLoading: false;
    }
  | {
      topics: undefined;
      isLoading: true;
    };

export const usePubSubTopics = (projectId: string): UsePubSubTopicsResult => {
  const { accessToken } = useGoogleApi();
  const [topics, setTopics] = useState<PubSubTopic[] | undefined>();

  useEffect(() => {
    (async () => {
      const data = await listPubSubTopics(projectId, accessToken);
      setTopics(data);
    })();
  }, [projectId]);

  return topics === undefined
    ? {
        topics: undefined,
        isLoading: true,
      }
    : {
        topics,
        isLoading: false,
      };
};

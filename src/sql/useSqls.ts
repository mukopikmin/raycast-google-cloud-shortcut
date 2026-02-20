import { useEffect, useState } from "react";
import { useGoogleApi } from "../auth/google";
import { listCloudSqls } from "./api";
import { Sql } from "./types";

type UseSqlsResult =
  | {
      sqls: Sql[];
      isLoading: false;
      error: undefined;
    }
  | {
      sqls: undefined;
      isLoading: true;
      error: undefined;
    };

export const useSqls = (projectId: string): UseSqlsResult => {
  const { accessToken } = useGoogleApi();
  const [sqls, setSqls] = useState<Sql[] | undefined>(undefined);

  useEffect(() => {
    const load = async () => {
      const fetchedSqls = await listCloudSqls(projectId, accessToken);
      setSqls(fetchedSqls);
    };

    load();
  }, [projectId]);

  return sqls === undefined
    ? {
        sqls: undefined,
        isLoading: true,
        error: undefined,
      }
    : {
        sqls,
        isLoading: false,
        error: undefined,
      };
};

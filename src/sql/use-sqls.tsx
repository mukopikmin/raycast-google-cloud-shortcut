import { useEffect, useState } from "react";
import { listCloudSqls, Sql } from "./sql";

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
  const [sqls, setSqls] = useState<Sql[] | undefined>(undefined);

  useEffect(() => {
    const load = async () => {
      const fetchedSqls = await listCloudSqls(projectId);
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

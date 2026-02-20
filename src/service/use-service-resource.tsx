import { Action } from "@raycast/api";
import { RunList } from "../run/run-list";
import { SecretManagerList } from "../secret-manager/list";
import { ServiceAccountList } from "../service-account/list";
import { SqlList } from "../sql/list";
import { StorageBucketList } from "../storage/list";
import { TasksLocationList } from "../tasks/location-list";
import { availableServices, isSearchEnabledService, SearchDisabledService, SearchEnabledService } from "./service";

export type UserServiceResourceResult = {
  services: (SearchableService | NonSearchableService)[];
};

type SearchableService = SearchEnabledService & {
  keywords: string[];
  isSearchEnabled: true;
  searchAction: React.ReactNode;
};

type NonSearchableService = SearchDisabledService & { keywords: string[]; isSearchEnabled: false };

export const useServiceResource = (projectId: string): UserServiceResourceResult => {
  return {
    services: availableServices.map((service): SearchableService | NonSearchableService => {
      const title = `Show ${service.name} Resources`;
      const keywords = [service.name, service.category];

      if (isSearchEnabledService(service)) {
        switch (service.name) {
          case "Cloud Run":
            return {
              ...service,
              keywords,
              isSearchEnabled: true,
              searchAction: <Action.Push title={title} target={<RunList projectId={projectId} />} />,
            };
          case "Cloud SQL":
            return {
              ...service,
              keywords,
              isSearchEnabled: true,
              searchAction: <Action.Push title={title} target={<SqlList projectId={projectId} />} />,
            };
          case "AlloyDB":
            return {
              ...service,
              keywords,
              isSearchEnabled: true,
              searchAction: <Action.Push title={title} target={<SqlList projectId={projectId} />} />,
            };
          case "Cloud Storage":
            return {
              ...service,
              keywords,
              isSearchEnabled: true,
              searchAction: <Action.Push title={title} target={<StorageBucketList projectId={projectId} />} />,
            };
          case "Tasks":
            return {
              ...service,
              keywords,
              isSearchEnabled: true,
              searchAction: <Action.Push title={title} target={<TasksLocationList projectId={projectId} />} />,
            };
          case "Secret Manager":
            return {
              ...service,
              keywords,
              isSearchEnabled: true,
              searchAction: <Action.Push title={title} target={<SecretManagerList projectId={projectId} />} />,
            };
          case "Service Accounts":
            return {
              ...service,
              keywords,
              isSearchEnabled: true,
              searchAction: <Action.Push title={title} target={<ServiceAccountList projectId={projectId} />} />,
            };
          default:
            service satisfies never;
        }
      }

      return {
        ...service,
        keywords,
        isSearchEnabled: false,
      };
    }),
  };
};

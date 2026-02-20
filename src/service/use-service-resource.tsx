import { Action } from "@raycast/api";
import { RunList } from "../run/run-list";
import { SecretManagerList } from "../secret-manager/list";
import { ServiceAccountList } from "../service-account/list";
import { SqlList } from "../sql/list";
import { StorageBucketList } from "../storage/list";
import { TasksLocationList } from "../tasks/location-list";
import { availableServices, Service, ServiceName } from "./service";

export type UserServiceResourceResult = {
  services: (SearchableService | NonSearchableService)[];
};

type ServiceBase = Service & {
  keywords: string[];
  isSearchEnabled: boolean;
};

type SearchableService = ServiceBase & { isSearchEnabled: true; searchAction: React.ReactNode };

type NonSearchableService = ServiceBase & { isSearchEnabled: false };

export const useServiceResource = (projectId: string): UserServiceResourceResult => {
  return {
    services: availableServices.map((service) => {
      const title = `Show ${service.name} Resources`;
      const keywords = [service.name, service.category];

      switch (service.name as ServiceName) {
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
          return {
            ...service,
            keywords,
            isSearchEnabled: false,
          };
      }
    }),
  };
};

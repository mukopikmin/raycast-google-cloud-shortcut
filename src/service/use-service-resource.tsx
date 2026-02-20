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

type SearchableService = Service & { isSearchEnabled: true; searchAction: React.ReactNode };

type NonSearchableService = Service & { isSearchEnabled: false };

export const useServiceResource = (projectId: string): UserServiceResourceResult => {
  return {
    services: availableServices.map((service) => {
      const title = `Show ${service.name} Resources`;

      switch (service.name as ServiceName) {
        case "Cloud Run":
          return {
            ...service,
            isSearchEnabled: true,
            searchAction: <Action.Push title={title} target={<RunList projectId={projectId} />} />,
          };

        case "Cloud SQL":
          return {
            ...service,
            isSearchEnabled: true,
            searchAction: <Action.Push title={title} target={<SqlList projectId={projectId} />} />,
          };
        case "AlloyDB":
          return {
            ...service,
            isSearchEnabled: true,
            searchAction: <Action.Push title={title} target={<SqlList projectId={projectId} />} />,
          };
        case "Cloud Storage":
          return {
            ...service,
            isSearchEnabled: true,
            searchAction: <Action.Push title={title} target={<StorageBucketList projectId={projectId} />} />,
          };
        case "Tasks":
          return {
            ...service,
            isSearchEnabled: true,
            searchAction: <Action.Push title={title} target={<TasksLocationList projectId={projectId} />} />,
          };
        case "Secret Manager":
          return {
            ...service,
            isSearchEnabled: true,
            searchAction: <Action.Push title={title} target={<SecretManagerList projectId={projectId} />} />,
          };
        case "Service Accounts":
          return {
            ...service,
            isSearchEnabled: true,
            searchAction: <Action.Push title={title} target={<ServiceAccountList projectId={projectId} />} />,
          };
        default:
          return {
            ...service,
            isSearchEnabled: false,
          };
      }
    }),
  };
};

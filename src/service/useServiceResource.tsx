import { Action } from "@raycast/api";
import { AlloyDbClusterList } from "../alloydb/AlloyDbClusterList";
import { CloudRunServicesList } from "../cloud-run/CloudRunServicesList";
import { SecretManagerList } from "../secret-manager/SecretManagerList";
import { ServiceAccountList } from "../service-account/ServiceAccountList";
import { CloudSqlInstanceList } from "../cloud-sql/CloudSqlInstanceList";
import { CloudStorageBucketList } from "../cloud-storage/CloudStorageBucketList";
import { isSearchEnabledService, SearchDisabledService, SearchEnabledService } from "./types";
import { availableServices } from "./constants";
import { PubSubSubscriptionList } from "../pubsub/PubSubSubscriptionList";
import { WorkflowList } from "../workflows/WorkflowList";
import { withRegionSelect } from "../region/withRegionSelect";
import { CloudSchedulerJobList } from "../cloud-scheduler/CloudSchedulerJobList";
import { CloudTasksQueueList } from "../cloud-tasks/CloudTasksQueueList";

export type UserServiceResourceResult = {
  services: (SearchableService | NonSearchableService)[];
};

type SearchableService = SearchEnabledService & {
  keywords: string[];
  isSearchEnabled: true;
  searchAction: React.ReactNode;
};

type NonSearchableService = SearchDisabledService & {
  keywords: string[];
  isSearchEnabled: false;
};

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
              searchAction: <Action.Push title={title} target={<CloudRunServicesList projectId={projectId} />} />,
            };
          case "Cloud SQL":
            return {
              ...service,
              keywords,
              isSearchEnabled: true,
              searchAction: <Action.Push title={title} target={<CloudSqlInstanceList projectId={projectId} />} />,
            };
          case "AlloyDB":
            return {
              ...service,
              keywords,
              isSearchEnabled: true,
              searchAction: <Action.Push title={title} target={<AlloyDbClusterList projectId={projectId} />} />,
            };
          case "Cloud Storage":
            return {
              ...service,
              keywords,
              isSearchEnabled: true,
              searchAction: <Action.Push title={title} target={<CloudStorageBucketList projectId={projectId} />} />,
            };
          case "Cloud Tasks":
            return {
              ...service,
              keywords,
              isSearchEnabled: true,
              searchAction: withRegionSelect({
                projectId,
                title,
                target: CloudTasksQueueList,
              }),
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
          case "Pub/Sub":
            return {
              ...service,
              keywords,
              isSearchEnabled: true,
              searchAction: <Action.Push title={title} target={<PubSubSubscriptionList projectId={projectId} />} />,
            };
          case "Workflows":
            return {
              ...service,
              keywords,
              isSearchEnabled: true,
              searchAction: <Action.Push title={title} target={<WorkflowList projectId={projectId} />} />,
            };
          case "Cloud Scheduler":
            return {
              ...service,
              keywords,
              isSearchEnabled: true,
              searchAction: withRegionSelect({
                projectId,
                title,
                target: CloudSchedulerJobList,
              }),
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

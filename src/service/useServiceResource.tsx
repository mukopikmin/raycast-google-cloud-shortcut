import { Action } from "@raycast/api";
import { AlloyDbClusterList } from "../resources/alloydb/AlloyDbClusterList";
import { CloudRunServicesList } from "../resources/cloud-run/CloudRunServicesList";
import { SecretManagerList } from "../resources/secret-manager/SecretManagerList";
import { ServiceAccountList } from "../resources/service-account/ServiceAccountList";
import { CloudSqlInstanceList } from "../resources/cloud-sql/CloudSqlInstanceList";
import { CloudStorageBucketList } from "../resources/cloud-storage/CloudStorageBucketList";
import { isSearchEnabledService, SearchDisabledService, SearchEnabledService } from "./types";
import { availableServices } from "./constants";
import { PubSubSubscriptionList } from "../resources/pubsub/PubSubSubscriptionList";
import { WorkflowList } from "../resources/workflows/WorkflowList";
import { withRegionSelect } from "../region/withRegionSelect";
import { CloudTasksQueueList } from "../resources/cloud-tasks/CloudTasksQueueList";
import { listCloudTasksLocations } from "../resources/cloud-tasks/api";
import { ArtifactRegistryRepositoryList } from "../resources/artifact-registry/ArtifactRegistryRepositoryList";
import { listArtifactRegistryLocations } from "../resources/artifact-registry/api";
import { CloudSchedulerJobList } from "../resources/cloud-scheduler/CloudSchedulerJobList";
import { listCloudSchedulerLocations } from "../resources/cloud-scheduler/api";
import { ErrorReportingErrorList } from "../resources/error-reporting/ErrorReportingErrorList";
import { AppEngineServiceList } from "../resources/app-engine/AppEngineServiceList";
import { CloudBuildList } from "../resources/cloud-build/CloudBuildList";
import { VpcNetworkList } from "../resources/vpc/VpcNetworkList";
import { CloudFunctionList } from "../resources/cloud-functions/CloudFunctionList";
import { KubernetesEngineClusterList } from "../resources/kubernetes-engine/KubernetesEngineClusterList";
import { ComputeEngineInstanceList } from "../resources/compute-engine/ComputeEngineInstanceList";
import { LoadBalancerList } from "../resources/load-balancing/LoadBalancerList";
import { IamList } from "../resources/iam/IamList";
import { AlertPolicyList } from "../resources/cloud-monitoring/AlertPolicyList";
import { DatastoreDatabaseList } from "../datastore/DatastoreDatabaseList";
import { WorkloadIdentityPoolList } from "../workload-identity/WorkloadIdentityPoolList";

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
          case "Datastore":
            return {
              ...service,
              keywords,
              isSearchEnabled: true,
              searchAction: <Action.Push title={title} target={<DatastoreDatabaseList projectId={projectId} />} />,
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
          case "Cloud Functions":
            return {
              ...service,
              keywords,
              isSearchEnabled: true,
              searchAction: <Action.Push title={title} target={<CloudFunctionList projectId={projectId} />} />,
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
                fetchLocations: listCloudTasksLocations,
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
                fetchLocations: listCloudSchedulerLocations,
              }),
            };
          case "Artifact Registry":
            return {
              ...service,
              keywords,
              isSearchEnabled: true,
              searchAction: withRegionSelect({
                projectId,
                title,
                target: ArtifactRegistryRepositoryList,
                fetchLocations: listArtifactRegistryLocations,
              }),
            };
          case "Error Reporting":
            return {
              ...service,
              keywords,
              isSearchEnabled: true,
              searchAction: <Action.Push title={title} target={<ErrorReportingErrorList projectId={projectId} />} />,
            };
          case "Cloud Monitoring":
            return {
              ...service,
              keywords,
              isSearchEnabled: true,
              searchAction: <Action.Push title={title} target={<AlertPolicyList projectId={projectId} />} />,
            };
          case "App Engine":
            return {
              ...service,
              keywords,
              isSearchEnabled: true,
              searchAction: <Action.Push title={title} target={<AppEngineServiceList projectId={projectId} />} />,
            };
          case "Cloud Build":
            return {
              ...service,
              keywords,
              isSearchEnabled: true,
              searchAction: <Action.Push title={title} target={<CloudBuildList projectId={projectId} />} />,
            };
          case "Kubernetes Engine":
            return {
              ...service,
              keywords,
              isSearchEnabled: true,
              searchAction: (
                <Action.Push title={title} target={<KubernetesEngineClusterList projectId={projectId} />} />
              ),
            };
          case "Compute Engine":
            return {
              ...service,
              keywords,
              isSearchEnabled: true,
              searchAction: <Action.Push title={title} target={<ComputeEngineInstanceList projectId={projectId} />} />,
            };
          case "Load Balancing":
            return {
              ...service,
              keywords,
              isSearchEnabled: true,
              searchAction: <Action.Push title={title} target={<LoadBalancerList projectId={projectId} />} />,
            };
          case "VPC Networks":
          case "IAM & Admin":
            return {
              ...service,
              keywords,
              isSearchEnabled: true,
              searchAction:
                service.name === "VPC Networks" ? (
                  <Action.Push title={title} target={<VpcNetworkList projectId={projectId} />} />
                ) : (
                  <Action.Push title={title} target={<IamList projectId={projectId} />} />
                ),
            };
          case "Workload Identity Federation":
            return {
              ...service,
              keywords,
              isSearchEnabled: true,
              searchAction: <Action.Push title={title} target={<WorkloadIdentityPoolList projectId={projectId} />} />,
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

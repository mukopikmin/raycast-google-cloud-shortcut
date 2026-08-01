import { describe, expect, it } from "vitest";
import { availableServices } from "./constants";

describe("availableServices", () => {
  it("uses the expected Console URL for every service shortcut", () => {
    expect(Object.fromEntries(availableServices.map((service) => [service.name, service.url]))).toEqual({
      "Compute Engine": "https://console.cloud.google.com/compute/instances",
      "Kubernetes Engine": "https://console.cloud.google.com/kubernetes/list",
      "Cloud Run": "https://console.cloud.google.com/run",
      "Cloud Functions": "https://console.cloud.google.com/functions",
      "App Engine": "https://console.cloud.google.com/appengine",
      Batch: "https://console.cloud.google.com/batch/jobs",
      "Cloud Storage": "https://console.cloud.google.com/storage/browser",
      "Transfer Service": "https://console.cloud.google.com/transfer",
      AlloyDB: "https://console.cloud.google.com/alloydb/clusters",
      Bigtable: "https://console.cloud.google.com/bigtable/instances",
      "Cloud SQL": "https://console.cloud.google.com/sql/instances",
      "Cloud Spanner": "https://console.cloud.google.com/spanner/instances",
      Firestore: "https://console.cloud.google.com/firestore",
      Datastore: "https://console.cloud.google.com/datastore",
      Memorystore: "https://console.cloud.google.com/memorystore",
      "VPC Networks": "https://console.cloud.google.com/networking/networks/list",
      "Load Balancing": "https://console.cloud.google.com/net-services/loadbalancing/list",
      "Cloud NAT": "https://console.cloud.google.com/net-services/nat/list",
      "Cloud DNS": "https://console.cloud.google.com/net-services/dns/zones",
      "Network Intelligence Center": "https://console.cloud.google.com/net-intelligence",
      "IAM & Admin": "https://console.cloud.google.com/iam-admin",
      "Service Accounts": "https://console.cloud.google.com/iam-admin/serviceaccounts",
      "Workload Identity Federation": "https://console.cloud.google.com/iam-admin/workload-identity-pools",
      "Organization Policies": "https://console.cloud.google.com/iam-admin/orgpolicies",
      "Secret Manager": "https://console.cloud.google.com/security/secret-manager",
      "Cloud KMS": "https://console.cloud.google.com/security/kms",
      "Certificate Manager": "https://console.cloud.google.com/security/ccm/list",
      "Security Command Center": "https://console.cloud.google.com/security/command-center",
      "Web Security Scanner": "https://console.cloud.google.com/security/web-scanner",
      "Cloud Logging": "https://console.cloud.google.com/logs",
      "Cloud Monitoring": "https://console.cloud.google.com/monitoring",
      "Error Reporting": "https://console.cloud.google.com/errors",
      "Cloud Trace": "https://console.cloud.google.com/traces/explorer",
      "Cloud Profiler": "https://console.cloud.google.com/profiler",
      "Pub/Sub": "https://console.cloud.google.com/cloudpubsub",
      Eventarc: "https://console.cloud.google.com/eventarc",
      Workflows: "https://console.cloud.google.com/workflows",
      "Cloud Scheduler": "https://console.cloud.google.com/cloudscheduler",
      "Cloud Tasks": "https://console.cloud.google.com/cloudtasks",
      "Artifact Registry": "https://console.cloud.google.com/artifacts",
      "Cloud Build": "https://console.cloud.google.com/cloud-build",
      "Infrastructure Manager": "https://console.cloud.google.com/infra-manager",
      BigQuery: "https://console.cloud.google.com/bigquery",
      "BigQuery Data Transfer": "https://console.cloud.google.com/bigquery/transfers",
      Dataproc: "https://console.cloud.google.com/dataproc/clusters",
      Dataflow: "https://console.cloud.google.com/dataflow",
      Composer: "https://console.cloud.google.com/composer",
      "Data Fusion": "https://console.cloud.google.com/data-fusion",
      Dataplex: "https://console.cloud.google.com/dataplex",
      "Vertex AI": "https://console.cloud.google.com/vertex-ai",
      "API & Services": "https://console.cloud.google.com/apis/dashboard",
      "API Library": "https://console.cloud.google.com/apis/library",
      Credentials: "https://console.cloud.google.com/apis/credentials",
      Billing: "https://console.cloud.google.com/billing",
      Quotas: "https://console.cloud.google.com/iam-admin/quotas",
      "Budgets & Alerts": "https://console.cloud.google.com/billing/budgets",
    });
  });

  it("does not include retired service shortcuts", () => {
    expect(availableServices.map((service) => service.name)).not.toContain("Cloud Debugger");
    expect(availableServices.map((service) => service.name)).not.toContain("Source Repositories");
  });

  it("uses Infrastructure Manager instead of Deployment Manager", () => {
    expect(availableServices).toContainEqual({
      name: "Infrastructure Manager",
      category: "DevOps",
      url: "https://console.cloud.google.com/infra-manager",
    });
    expect(availableServices.map((service) => service.name)).not.toContain("Deployment Manager");
  });
});

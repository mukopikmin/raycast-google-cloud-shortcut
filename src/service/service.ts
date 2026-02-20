export type Service = SearchEnabledService | SearchDisabledService;

export type SearchEnabledService = {
  name: SearchEnabledServiceName;
  category: Category;
  url: string;
};

export type SearchDisabledService = {
  name: SearchDisabledServiceName;
  category: Category;
  url: string;
};

export const serchEnabledSeriviceNames = [
  "Cloud Run",
  "Cloud SQL",
  "AlloyDB",
  "Cloud Storage",
  "Tasks",
  "Secret Manager",
  "Service Accounts",
] as const;

export const searchDisabledServiceNames = [
  "BigQuery",
  "BigQuery Data Transfer",
  "Bigtable",
  "Cloud Spanner",
  "Firestore",
  "Datastore",
  "Memorystore",
  "Compute Engine",
  "Instance Templates",
  "Instance Groups",
  "Disks",
  "Images",
  "Snapshots",
  "Kubernetes Engine",
  "Cloud Functions",
  "App Engine",
  "Batch",
  "Transfer Service",
  "VPC Networks",
  "Subnets",
  "Firewall Rules",
  "Routes",
  "Load Balancing",
  "Cloud NAT",
  "Cloud DNS",
  "Network Intelligence Center",
  "IAM & Admin",
  "Workload Identity Federation",
  "Organization Policies",
  "Cloud KMS",
  "Certificate Manager",
  "Security Command Center",
  "Web Security Scanner",
  "Cloud Logging",
  "Cloud Monitoring",
  "Error Reporting",
  "Cloud Trace",
  "Cloud Profiler",
  "Cloud Debugger",
  "Pub/Sub",
  "Eventarc",
  "Workflows",
  "Cloud Scheduler",
  "Artifact Registry",
  "Cloud Build",
  "Source Repositories",
  "Deployment Manager",
  "Dataproc",
  "Dataflow",
  "Composer",
  "Data Fusion",
  "Dataplex",
  "Vertex AI",
  "Vertex AI Workbench",
  "AutoML",
  "API & Services",
  "API Library",
  "Credentials",
  "Billing",
  "Quotas",
  "Budgets & Alerts",
] as const;

export type ServiceName = SearchEnabledServiceName | SearchDisabledServiceName;

export type SearchEnabledServiceName = (typeof serchEnabledSeriviceNames)[number];

export const isSearchEnabledService = (value: Service): value is SearchEnabledService => {
  return serchEnabledSeriviceNames.includes(value.name as SearchEnabledServiceName);
};

export const isSearchEnabledServiceName = (value: ServiceName): value is SearchEnabledServiceName => {
  return serchEnabledSeriviceNames.includes(value as SearchEnabledServiceName);
};

export type SearchDisabledServiceName = (typeof searchDisabledServiceNames)[number];

type Category =
  | "Compute"
  | "Storage"
  | "Database"
  | "Networking"
  | "Security"
  | "Operations"
  | "DevOps"
  | "Data Analytics"
  | "Machine Learning"
  | "Integration"
  | "Billing";

export const availableServices: Service[] = [
  {
    name: "AlloyDB",
    category: "Database",
    url: "https://console.cloud.google.com/alloydb/clusters",
  },
  {
    name: "BigQuery",
    category: "Data Analytics",
    url: "https://console.cloud.google.com/bigquery",
  },
  {
    name: "BigQuery Data Transfer",
    category: "Data Analytics",
    url: "https://console.cloud.google.com/bigquery/transfers",
  },
  {
    name: "Bigtable",
    category: "Database",
    url: "https://console.cloud.google.com/bigtable/instances",
  },
  {
    name: "Cloud SQL",
    category: "Database",
    url: "https://console.cloud.google.com/sql/instances",
  },
  {
    name: "Cloud Spanner",
    category: "Database",
    url: "https://console.cloud.google.com/spanner/instances",
  },
  {
    name: "Firestore",
    category: "Database",
    url: "https://console.cloud.google.com/firestore",
  },
  {
    name: "Datastore",
    category: "Database",
    url: "https://console.cloud.google.com/datastore",
  },
  {
    name: "Memorystore",
    category: "Database",
    url: "https://console.cloud.google.com/memorystore",
  },

  {
    name: "Compute Engine",
    category: "Compute",
    url: "https://console.cloud.google.com/compute/instances",
  },
  {
    name: "Instance Templates",
    category: "Compute",
    url: "https://console.cloud.google.com/compute/instanceTemplates",
  },
  {
    name: "Instance Groups",
    category: "Compute",
    url: "https://console.cloud.google.com/compute/instanceGroups",
  },
  {
    name: "Images",
    category: "Compute",
    url: "https://console.cloud.google.com/compute/images",
  },
  {
    name: "Snapshots",
    category: "Compute",
    url: "https://console.cloud.google.com/compute/snapshots",
  },

  {
    name: "Kubernetes Engine",
    category: "Compute",
    url: "https://console.cloud.google.com/kubernetes/list",
  },
  {
    name: "Cloud Run",
    category: "Compute",
    url: "https://console.cloud.google.com/run",
  },
  {
    name: "Cloud Functions",
    category: "Compute",
    url: "https://console.cloud.google.com/functions",
  },
  {
    name: "App Engine",
    category: "Compute",
    url: "https://console.cloud.google.com/appengine",
  },
  {
    name: "Batch",
    category: "Compute",
    url: "https://console.cloud.google.com/batch/jobs",
  },

  {
    name: "Cloud Storage",
    category: "Storage",
    url: "https://console.cloud.google.com/storage/browser",
  },
  {
    name: "Transfer Service",
    category: "Storage",
    url: "https://console.cloud.google.com/transfer",
  },

  {
    name: "VPC Networks",
    category: "Networking",
    url: "https://console.cloud.google.com/networking/networks/list",
  },
  {
    name: "Subnets",
    category: "Networking",
    url: "https://console.cloud.google.com/networking/subnetworks/list",
  },
  {
    name: "Firewall Rules",
    category: "Networking",
    url: "https://console.cloud.google.com/networking/firewalls/list",
  },
  {
    name: "Routes",
    category: "Networking",
    url: "https://console.cloud.google.com/networking/routes/list",
  },
  {
    name: "Load Balancing",
    category: "Networking",
    url: "https://console.cloud.google.com/net-services/loadbalancing/list",
  },
  {
    name: "Cloud NAT",
    category: "Networking",
    url: "https://console.cloud.google.com/net-services/nat/list",
  },
  {
    name: "Cloud DNS",
    category: "Networking",
    url: "https://console.cloud.google.com/net-services/dns/zones",
  },
  {
    name: "Network Intelligence Center",
    category: "Networking",
    url: "https://console.cloud.google.com/net-intelligence",
  },

  {
    name: "IAM & Admin",
    category: "Security",
    url: "https://console.cloud.google.com/iam-admin",
  },
  {
    name: "Service Accounts",
    category: "Security",
    url: "https://console.cloud.google.com/iam-admin/serviceaccounts",
  },
  {
    name: "Workload Identity Federation",
    category: "Security",
    url: "https://console.cloud.google.com/iam-admin/workload-identity-pools",
  },
  {
    name: "Organization Policies",
    category: "Security",
    url: "https://console.cloud.google.com/iam-admin/orgpolicies",
  },

  {
    name: "Secret Manager",
    category: "Security",
    url: "https://console.cloud.google.com/security/secret-manager",
  },
  {
    name: "Cloud KMS",
    category: "Security",
    url: "https://console.cloud.google.com/security/kms",
  },
  {
    name: "Certificate Manager",
    category: "Security",
    url: "https://console.cloud.google.com/security/certificates",
  },
  {
    name: "Security Command Center",
    category: "Security",
    url: "https://console.cloud.google.com/security/command-center",
  },
  {
    name: "Web Security Scanner",
    category: "Security",
    url: "https://console.cloud.google.com/security/web-scanner",
  },

  {
    name: "Cloud Logging",
    category: "Operations",
    url: "https://console.cloud.google.com/logs",
  },
  {
    name: "Cloud Monitoring",
    category: "Operations",
    url: "https://console.cloud.google.com/monitoring",
  },
  {
    name: "Error Reporting",
    category: "Operations",
    url: "https://console.cloud.google.com/errors",
  },
  {
    name: "Cloud Trace",
    category: "Operations",
    url: "https://console.cloud.google.com/traces",
  },
  {
    name: "Cloud Profiler",
    category: "Operations",
    url: "https://console.cloud.google.com/profiler",
  },
  {
    name: "Cloud Debugger",
    category: "Operations",
    url: "https://console.cloud.google.com/debug",
  },

  {
    name: "Pub/Sub",
    category: "Integration",
    url: "https://console.cloud.google.com/cloudpubsub",
  },
  {
    name: "Eventarc",
    category: "Integration",
    url: "https://console.cloud.google.com/eventarc",
  },
  {
    name: "Workflows",
    category: "Integration",
    url: "https://console.cloud.google.com/workflows",
  },
  {
    name: "Cloud Scheduler",
    category: "Integration",
    url: "https://console.cloud.google.com/cloudscheduler",
  },
  {
    name: "Tasks",
    category: "Integration",
    url: "https://console.cloud.google.com/cloudtasks",
  },

  {
    name: "Artifact Registry",
    category: "DevOps",
    url: "https://console.cloud.google.com/artifacts",
  },
  {
    name: "Cloud Build",
    category: "DevOps",
    url: "https://console.cloud.google.com/cloud-build",
  },
  {
    name: "Source Repositories",
    category: "DevOps",
    url: "https://console.cloud.google.com/source",
  },
  {
    name: "Deployment Manager",
    category: "DevOps",
    url: "https://console.cloud.google.com/dm/deployments",
  },

  {
    name: "Dataproc",
    category: "Data Analytics",
    url: "https://console.cloud.google.com/dataproc/clusters",
  },
  {
    name: "Dataflow",
    category: "Data Analytics",
    url: "https://console.cloud.google.com/dataflow",
  },
  {
    name: "Composer",
    category: "Data Analytics",
    url: "https://console.cloud.google.com/composer",
  },
  {
    name: "Data Fusion",
    category: "Data Analytics",
    url: "https://console.cloud.google.com/data-fusion",
  },
  {
    name: "Dataplex",
    category: "Data Analytics",
    url: "https://console.cloud.google.com/dataplex",
  },

  {
    name: "Vertex AI",
    category: "Machine Learning",
    url: "https://console.cloud.google.com/vertex-ai",
  },
  {
    name: "Vertex AI Workbench",
    category: "Machine Learning",
    url: "https://console.cloud.google.com/vertex-ai/workbench",
  },
  {
    name: "AutoML",
    category: "Machine Learning",
    url: "https://console.cloud.google.com/vertex-ai/datasets",
  },

  {
    name: "API & Services",
    category: "Billing",
    url: "https://console.cloud.google.com/apis/dashboard",
  },
  {
    name: "API Library",
    category: "Billing",
    url: "https://console.cloud.google.com/apis/library",
  },
  {
    name: "Credentials",
    category: "Billing",
    url: "https://console.cloud.google.com/apis/credentials",
  },
  {
    name: "Billing",
    category: "Billing",
    url: "https://console.cloud.google.com/billing",
  },
  {
    name: "Quotas",
    category: "Billing",
    url: "https://console.cloud.google.com/iam-admin/quotas",
  },
  {
    name: "Budgets & Alerts",
    category: "Billing",
    url: "https://console.cloud.google.com/billing/budgets",
  },
];

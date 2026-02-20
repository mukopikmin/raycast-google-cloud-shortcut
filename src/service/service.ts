export type Service = {
  name: ServiceName;
  category: Category;
  url: string;
  isSearchEnabled: boolean;
};

export type ServiceName =
  | "AlloyDB"
  | "BigQuery"
  | "BigQuery Data Transfer"
  | "Bigtable"
  | "Cloud SQL"
  | "Cloud Spanner"
  | "Firestore"
  | "Datastore"
  | "Memorystore"
  | "Compute Engine"
  | "Instance Templates"
  | "Instance Groups"
  | "Disks"
  | "Images"
  | "Snapshots"
  | "Kubernetes Engine"
  | "Cloud Run"
  | "Cloud Functions"
  | "App Engine"
  | "Batch"
  | "Cloud Storage"
  | "Transfer Service"
  | "VPC Networks"
  | "Subnets"
  | "Firewall Rules"
  | "Routes"
  | "Load Balancing"
  | "Cloud NAT"
  | "Cloud DNS"
  | "Network Intelligence Center"
  | "IAM & Admin"
  | "Service Accounts"
  | "Workload Identity Federation"
  | "Organization Policies"
  | "Secret Manager"
  | "Cloud KMS"
  | "Certificate Manager"
  | "Security Command Center"
  | "Web Security Scanner"
  | "Cloud Logging"
  | "Cloud Monitoring"
  | "Error Reporting"
  | "Cloud Trace"
  | "Cloud Profiler"
  | "Cloud Debugger"
  | "Pub/Sub"
  | "Eventarc"
  | "Workflows"
  | "Cloud Scheduler"
  | "Tasks"
  | "Artifact Registry"
  | "Cloud Build"
  | "Source Repositories"
  | "Deployment Manager"
  | "Dataproc"
  | "Dataflow"
  | "Composer"
  | "Data Fusion"
  | "Dataplex"
  | "Vertex AI"
  | "Vertex AI Workbench"
  | "AutoML"
  | "API & Services"
  | "API Library"
  | "Credentials"
  | "Billing"
  | "Quotas"
  | "Budgets & Alerts";

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
    isSearchEnabled: false,
  },
  {
    name: "BigQuery",
    category: "Data Analytics",
    url: "https://console.cloud.google.com/bigquery",
    isSearchEnabled: false,
  },
  {
    name: "BigQuery Data Transfer",
    category: "Data Analytics",
    url: "https://console.cloud.google.com/bigquery/transfers",
    isSearchEnabled: false,
  },
  {
    name: "Bigtable",
    category: "Database",
    url: "https://console.cloud.google.com/bigtable/instances",
    isSearchEnabled: false,
  },
  {
    name: "Cloud SQL",
    category: "Database",
    url: "https://console.cloud.google.com/sql/instances",
    isSearchEnabled: false,
  },
  {
    name: "Cloud Spanner",
    category: "Database",
    url: "https://console.cloud.google.com/spanner/instances",
    isSearchEnabled: false,
  },
  {
    name: "Firestore",
    category: "Database",
    url: "https://console.cloud.google.com/firestore",
    isSearchEnabled: false,
  },
  {
    name: "Datastore",
    category: "Database",
    url: "https://console.cloud.google.com/datastore",
    isSearchEnabled: false,
  },
  {
    name: "Memorystore",
    category: "Database",
    url: "https://console.cloud.google.com/memorystore",
    isSearchEnabled: false,
  },

  {
    name: "Compute Engine",
    category: "Compute",
    url: "https://console.cloud.google.com/compute/instances",
    isSearchEnabled: false,
  },
  {
    name: "Instance Templates",
    category: "Compute",
    url: "https://console.cloud.google.com/compute/instanceTemplates",
    isSearchEnabled: false,
  },
  {
    name: "Instance Groups",
    category: "Compute",
    url: "https://console.cloud.google.com/compute/instanceGroups",
    isSearchEnabled: false,
  },
  { name: "Disks", category: "Compute", url: "https://console.cloud.google.com/compute/disks", isSearchEnabled: false },
  {
    name: "Images",
    category: "Compute",
    url: "https://console.cloud.google.com/compute/images",
    isSearchEnabled: false,
  },
  {
    name: "Snapshots",
    category: "Compute",
    url: "https://console.cloud.google.com/compute/snapshots",
    isSearchEnabled: false,
  },

  {
    name: "Kubernetes Engine",
    category: "Compute",
    url: "https://console.cloud.google.com/kubernetes/list",
    isSearchEnabled: false,
  },
  { name: "Cloud Run", category: "Compute", url: "https://console.cloud.google.com/run", isSearchEnabled: false },
  {
    name: "Cloud Functions",
    category: "Compute",
    url: "https://console.cloud.google.com/functions",
    isSearchEnabled: false,
  },
  {
    name: "App Engine",
    category: "Compute",
    url: "https://console.cloud.google.com/appengine",
    isSearchEnabled: false,
  },
  { name: "Batch", category: "Compute", url: "https://console.cloud.google.com/batch/jobs", isSearchEnabled: false },

  {
    name: "Cloud Storage",
    category: "Storage",
    url: "https://console.cloud.google.com/storage/browser",
    isSearchEnabled: false,
  },
  {
    name: "Transfer Service",
    category: "Storage",
    url: "https://console.cloud.google.com/transfer",
    isSearchEnabled: false,
  },

  {
    name: "VPC Networks",
    category: "Networking",
    url: "https://console.cloud.google.com/networking/networks/list",
    isSearchEnabled: false,
  },
  {
    name: "Subnets",
    category: "Networking",
    url: "https://console.cloud.google.com/networking/subnetworks/list",
    isSearchEnabled: false,
  },
  {
    name: "Firewall Rules",
    category: "Networking",
    url: "https://console.cloud.google.com/networking/firewalls/list",
    isSearchEnabled: false,
  },
  {
    name: "Routes",
    category: "Networking",
    url: "https://console.cloud.google.com/networking/routes/list",
    isSearchEnabled: false,
  },
  {
    name: "Load Balancing",
    category: "Networking",
    url: "https://console.cloud.google.com/net-services/loadbalancing/list",
    isSearchEnabled: false,
  },
  {
    name: "Cloud NAT",
    category: "Networking",
    url: "https://console.cloud.google.com/net-services/nat/list",
    isSearchEnabled: false,
  },
  {
    name: "Cloud DNS",
    category: "Networking",
    url: "https://console.cloud.google.com/net-services/dns/zones",
    isSearchEnabled: false,
  },
  {
    name: "Network Intelligence Center",
    category: "Networking",
    url: "https://console.cloud.google.com/net-intelligence",
    isSearchEnabled: false,
  },

  {
    name: "IAM & Admin",
    category: "Security",
    url: "https://console.cloud.google.com/iam-admin",
    isSearchEnabled: false,
  },
  {
    name: "Service Accounts",
    category: "Security",
    url: "https://console.cloud.google.com/iam-admin/serviceaccounts",
    isSearchEnabled: false,
  },
  {
    name: "Workload Identity Federation",
    category: "Security",
    url: "https://console.cloud.google.com/iam-admin/workload-identity-pools",
    isSearchEnabled: false,
  },
  {
    name: "Organization Policies",
    category: "Security",
    url: "https://console.cloud.google.com/iam-admin/orgpolicies",
    isSearchEnabled: false,
  },

  {
    name: "Secret Manager",
    category: "Security",
    url: "https://console.cloud.google.com/security/secret-manager",
    isSearchEnabled: false,
  },
  {
    name: "Cloud KMS",
    category: "Security",
    url: "https://console.cloud.google.com/security/kms",
    isSearchEnabled: false,
  },
  {
    name: "Certificate Manager",
    category: "Security",
    url: "https://console.cloud.google.com/security/certificates",
    isSearchEnabled: false,
  },
  {
    name: "Security Command Center",
    category: "Security",
    url: "https://console.cloud.google.com/security/command-center",
    isSearchEnabled: false,
  },
  {
    name: "Web Security Scanner",
    category: "Security",
    url: "https://console.cloud.google.com/security/web-scanner",
    isSearchEnabled: false,
  },

  {
    name: "Cloud Logging",
    category: "Operations",
    url: "https://console.cloud.google.com/logs",
    isSearchEnabled: false,
  },
  {
    name: "Cloud Monitoring",
    category: "Operations",
    url: "https://console.cloud.google.com/monitoring",
    isSearchEnabled: false,
  },
  {
    name: "Error Reporting",
    category: "Operations",
    url: "https://console.cloud.google.com/errors",
    isSearchEnabled: false,
  },
  {
    name: "Cloud Trace",
    category: "Operations",
    url: "https://console.cloud.google.com/traces",
    isSearchEnabled: false,
  },
  {
    name: "Cloud Profiler",
    category: "Operations",
    url: "https://console.cloud.google.com/profiler",
    isSearchEnabled: false,
  },
  {
    name: "Cloud Debugger",
    category: "Operations",
    url: "https://console.cloud.google.com/debug",
    isSearchEnabled: false,
  },

  {
    name: "Pub/Sub",
    category: "Integration",
    url: "https://console.cloud.google.com/cloudpubsub",
    isSearchEnabled: false,
  },
  {
    name: "Eventarc",
    category: "Integration",
    url: "https://console.cloud.google.com/eventarc",
    isSearchEnabled: false,
  },
  {
    name: "Workflows",
    category: "Integration",
    url: "https://console.cloud.google.com/workflows",
    isSearchEnabled: false,
  },
  {
    name: "Cloud Scheduler",
    category: "Integration",
    url: "https://console.cloud.google.com/cloudscheduler",
    isSearchEnabled: false,
  },
  {
    name: "Tasks",
    category: "Integration",
    url: "https://console.cloud.google.com/cloudtasks",
    isSearchEnabled: false,
  },

  {
    name: "Artifact Registry",
    category: "DevOps",
    url: "https://console.cloud.google.com/artifacts",
    isSearchEnabled: false,
  },
  {
    name: "Cloud Build",
    category: "DevOps",
    url: "https://console.cloud.google.com/cloud-build",
    isSearchEnabled: false,
  },
  {
    name: "Source Repositories",
    category: "DevOps",
    url: "https://console.cloud.google.com/source",
    isSearchEnabled: false,
  },
  {
    name: "Deployment Manager",
    category: "DevOps",
    url: "https://console.cloud.google.com/dm/deployments",
    isSearchEnabled: false,
  },

  {
    name: "Dataproc",
    category: "Data Analytics",
    url: "https://console.cloud.google.com/dataproc/clusters",
    isSearchEnabled: false,
  },
  {
    name: "Dataflow",
    category: "Data Analytics",
    url: "https://console.cloud.google.com/dataflow",
    isSearchEnabled: false,
  },
  {
    name: "Composer",
    category: "Data Analytics",
    url: "https://console.cloud.google.com/composer",
    isSearchEnabled: false,
  },
  {
    name: "Data Fusion",
    category: "Data Analytics",
    url: "https://console.cloud.google.com/data-fusion",
    isSearchEnabled: false,
  },
  {
    name: "Dataplex",
    category: "Data Analytics",
    url: "https://console.cloud.google.com/dataplex",
    isSearchEnabled: false,
  },

  {
    name: "Vertex AI",
    category: "Machine Learning",
    url: "https://console.cloud.google.com/vertex-ai",
    isSearchEnabled: false,
  },
  {
    name: "Vertex AI Workbench",
    category: "Machine Learning",
    url: "https://console.cloud.google.com/vertex-ai/workbench",
    isSearchEnabled: false,
  },
  {
    name: "AutoML",
    category: "Machine Learning",
    url: "https://console.cloud.google.com/vertex-ai/datasets",
    isSearchEnabled: false,
  },

  {
    name: "API & Services",
    category: "Billing",
    url: "https://console.cloud.google.com/apis/dashboard",
    isSearchEnabled: false,
  },
  {
    name: "API Library",
    category: "Billing",
    url: "https://console.cloud.google.com/apis/library",
    isSearchEnabled: false,
  },
  {
    name: "Credentials",
    category: "Billing",
    url: "https://console.cloud.google.com/apis/credentials",
    isSearchEnabled: false,
  },
  { name: "Billing", category: "Billing", url: "https://console.cloud.google.com/billing", isSearchEnabled: false },
  {
    name: "Quotas",
    category: "Billing",
    url: "https://console.cloud.google.com/iam-admin/quotas",
    isSearchEnabled: false,
  },
  {
    name: "Budgets & Alerts",
    category: "Billing",
    url: "https://console.cloud.google.com/billing/budgets",
    isSearchEnabled: false,
  },
];

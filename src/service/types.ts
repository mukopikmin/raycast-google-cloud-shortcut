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
  "Cloud Functions",
  "Cloud Tasks",
  "Secret Manager",
  "Service Accounts",
  "Pub/Sub",
  "Workflows",
  "Cloud Scheduler",
  "Artifact Registry",
  "Error Reporting",
  "App Engine",
  "Cloud Build",
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
  "Kubernetes Engine",
  "Batch",
  "Transfer Service",
  "VPC Networks",
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
  "Cloud Trace",
  "Cloud Profiler",
  "Cloud Debugger",
  "Eventarc",
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

// Assert that there is no overlap between SearchEnabledServiceName and SearchDisabledServiceName
type Overlap = Extract<SearchEnabledServiceName, SearchDisabledServiceName>;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _: Overlap = null as never;

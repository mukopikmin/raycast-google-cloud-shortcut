# Google Cloud Shortcut (Raycast Extension)

Open the Google Cloud service console quickly.

## Installation

### From Raycast Store

TBD

### Local Development

1. Clone this repository.
2. Run `npm install` to install dependencies.
3. Run `npm run dev` to build the extension and install it in your local Raycast.

## Usage

This extension provides the following commands:

- **Search Google Cloud Resources**: Quickly search and navigate to your Google Cloud projects and services.

You can refresh the cached project list from the project list actions.

## Authorization

This extension uses Google OAuth with the `cloud-platform` scope. Search results depend on the Google Cloud projects, APIs, and resource permissions available to the signed-in account.

## Supported Services

This extension supports quick navigation to Google Cloud services. For some services, you can also search and navigate directly to their resources (like instances, buckets, or clusters).

Cloud Logging shortcuts are rolled out incrementally. The table below shows the current support status for both resource search and Cloud Logging shortcuts.

| Service Name | Category | Resource Search | Cloud Logging Shortcut |
|---|---|---|---|
| Compute Engine | Compute | Instances | - |
| Kubernetes Engine | Compute | Clusters | - |
| Cloud Run | Compute | Services, Jobs & Worker Pools | Yes |
| Cloud Functions | Compute | Functions (gen1) | Yes |
| App Engine | Compute | Services | - |
| Batch | Compute | - | - |
| Cloud Storage | Storage | Buckets | - |
| Transfer Service | Storage | - | - |
| AlloyDB | Database | Clusters | Yes |
| Bigtable | Database | - | - |
| Cloud SQL | Database | Instances | Yes |
| Cloud Spanner | Database | - | - |
| Firestore | Database | - | - |
| Datastore | Database | - | - |
| Memorystore | Database | - | - |
| VPC Networks | Networking | Networks | - |
| Load Balancing | Networking | Forwarding Rules & Addresses | - |
| Cloud NAT | Networking | - | - |
| Cloud DNS | Networking | - | - |
| Network Intelligence Center | Networking | - | - |
| IAM & Admin | Security | IAM Policy Bindings | - |
| Service Accounts | Security | Service Accounts | - |
| Workload Identity Federation | Security | - | - |
| Organization Policies | Security | - | - |
| Secret Manager | Security | Secrets | - |
| Cloud KMS | Security | - | - |
| Certificate Manager | Security | - | - |
| Security Command Center | Security | - | - |
| Web Security Scanner | Security | - | - |
| Cloud Logging | Operations | - | - |
| Cloud Monitoring | Operations | Alert Policies | - |
| Error Reporting | Operations | Errors | - |
| Cloud Trace | Operations | - | - |
| Cloud Profiler | Operations | - | - |
| Pub/Sub | Integration | Topics & Subscriptions | - |
| Eventarc | Integration | - | - |
| Workflows | Integration | Workflows | - |
| Cloud Scheduler | Integration | Jobs | - |
| Cloud Tasks | Integration | Queues | - |
| Artifact Registry | DevOps | Repositories | - |
| Cloud Build | DevOps | Builds | - |
| Infrastructure Manager | DevOps | - | - |
| BigQuery | Data Analytics | - | - |
| BigQuery Data Transfer | Data Analytics | - | - |
| Dataproc | Data Analytics | - | - |
| Dataflow | Data Analytics | - | - |
| Composer | Data Analytics | - | - |
| Data Fusion | Data Analytics | - | - |
| Dataplex | Data Analytics | - | - |
| Vertex AI | Machine Learning | - | - |
| API & Services | Billing | - | - |
| API Library | Billing | - | - |
| Credentials | Billing | - | - |
| Billing | Billing | - | - |
| Quotas | Billing | - | - |
| Budgets & Alerts | Billing | - | - |

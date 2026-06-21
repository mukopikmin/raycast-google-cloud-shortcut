# Google Cloud Shortcut

Open Google Cloud Console pages from Raycast without switching to a browser tab first.

Use this extension to pick a Google Cloud project, search supported Google Cloud services, and open service pages or individual resources in Google Cloud Console.

## Setup

1. Open Raycast and run **Search Google Cloud Resources**.
2. Sign in with the Google account that has access to your Google Cloud projects.
3. Review the Google permission request and approve it.
4. Select a project from the project list.
5. Select a Google Cloud service or a searchable resource to open it in Google Cloud Console.

The extension stores your project list in Raycast local storage so it can show projects faster the next time you open the command.

## Refreshing Projects

If a project is missing, renamed, or no longer available, refresh the cached project list:

1. Run **Search Google Cloud Resources**.
2. Open the action menu on the project list.
3. Choose **Refresh Projects**.

The refresh action fetches your current Google Cloud projects again and updates the local cache.

## Permissions

Google Cloud Shortcut asks Google for the `https://www.googleapis.com/auth/cloud-platform` OAuth scope.

The extension uses this permission to:

- List the Google Cloud projects available to your Google account.
- List metadata for supported resources such as Cloud Run services, Cloud SQL instances, Cloud Storage buckets, Pub/Sub topics, and other resources shown in the command.
- Open the matching Google Cloud Console page for the selected project, service, or resource.

The extension only calls Google Cloud APIs to read project and resource metadata. It does not create, update, or delete Google Cloud resources.

## Usage

Run **Search Google Cloud Resources** from Raycast.

The command first shows your Google Cloud projects. After selecting a project, it shows supported Google Cloud services. Services with resource search support include a search action for their resources; every service can be opened directly in Google Cloud Console for the selected project.

## Supported Services

This extension supports quick navigation to Google Cloud services. For some services, you can also search and navigate directly to resources such as instances, buckets, clusters, jobs, or queues.

Cloud Logging shortcuts are available for selected resource types. The table below shows the current support status for both resource search and Cloud Logging shortcuts.

| Service Name | Category | Resource Search | Cloud Logging Shortcut |
|---|---|---|---|
| Compute Engine | Compute | Instances | - |
| Kubernetes Engine | Compute | - | - |
| Cloud Run | Compute | Services, Jobs, Worker Pools | Yes |
| Cloud Functions | Compute | Functions (gen1) | Yes |
| App Engine | Compute | Services | - |
| Batch | Compute | - | - |
| Cloud Storage | Storage | Buckets | - |
| Transfer Service | Storage | - | - |
| AlloyDB | Database | Clusters | - |
| Bigtable | Database | - | - |
| Cloud SQL | Database | Instances | - |
| Cloud Spanner | Database | - | - |
| Firestore | Database | - | - |
| Datastore | Database | - | - |
| Memorystore | Database | - | - |
| VPC Networks | Networking | Networks | - |
| Load Balancing | Networking | - | - |
| Cloud NAT | Networking | - | - |
| Cloud DNS | Networking | - | - |
| Network Intelligence Center | Networking | - | - |
| IAM & Admin | Security | Members & Roles | - |
| Service Accounts | Security | Service Accounts | - |
| Workload Identity Federation | Security | - | - |
| Organization Policies | Security | - | - |
| Secret Manager | Security | Secrets | - |
| Cloud KMS | Security | - | - |
| Certificate Manager | Security | - | - |
| Security Command Center | Security | - | - |
| Web Security Scanner | Security | - | - |
| Cloud Logging | Operations | - | - |
| Cloud Monitoring | Operations | - | - |
| Error Reporting | Operations | Errors | - |
| Cloud Trace | Operations | - | - |
| Cloud Profiler | Operations | - | - |
| Cloud Debugger | Operations | - | - |
| Pub/Sub | Integration | Topics, Subscriptions | - |
| Eventarc | Integration | - | - |
| Workflows | Integration | Workflows | - |
| Cloud Scheduler | Integration | Jobs | - |
| Cloud Tasks | Integration | Queues | - |
| Artifact Registry | DevOps | Repositories | - |
| Cloud Build | DevOps | Builds | - |
| Source Repositories | DevOps | - | - |
| Deployment Manager | DevOps | - | - |
| BigQuery | Data Analytics | - | - |
| BigQuery Data Transfer | Data Analytics | - | - |
| Dataproc | Data Analytics | - | - |
| Dataflow | Data Analytics | - | - |
| Composer | Data Analytics | - | - |
| Data Fusion | Data Analytics | - | - |
| Dataplex | Data Analytics | - | - |
| Vertex AI | Machine Learning | - | - |
| Vertex AI Workbench | Machine Learning | - | - |
| AutoML | Machine Learning | - | - |
| API & Services | Billing | - | - |
| API Library | Billing | - | - |
| Credentials | Billing | - | - |
| Billing | Billing | - | - |
| Quotas | Billing | - | - |
| Budgets & Alerts | Billing | - | - |

## Local Development

1. Clone this repository.
2. Run `npm install` to install dependencies.
3. Run `npm run dev` to build the extension and install it in your local Raycast.

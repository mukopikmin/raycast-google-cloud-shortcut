# Google Cloud Shortcut (Raycast Extension)

Open Google Cloud Console pages from Raycast without switching to a browser tab first.

Use this extension to pick a Google Cloud project, search supported Google Cloud services, and open service pages or individual resources in Google Cloud Console.

## Installation

### From Raycast Store

TBD

### Local Development

1. Clone this repository.
2. Run `npm install` to install dependencies.
3. Run `npm run dev` to build the extension and install it in your local Raycast.

## Signing In

Resource access and project refresh open **Sign in to Google Cloud** when authentication is needed, then return to the selected resource list or the refreshed project list. You can also run this command directly to sign in again. Browsing cached projects and opening Console shortcuts do not require signing in.

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

Paginated resource lists initially load one page. Choose **Load More** to fetch the next page when browsing without a search query. Lists keep at most 500 resources in memory: loading more beyond 500 replaces the oldest displayed results, so resources after the first 500 remain accessible. The list shows a notice when earlier results are omitted; choose **Reload from Start** to revisit them. Search includes resources that have not been loaded and earlier results that were removed from the displayed window. Each new query scans from the first API page, discards nonmatching resources, and scans all API pages while retaining at most the best 500 matches. Exact and prefix name matches rank ahead of substring and metadata matches, so a later resource such as `journal` can appear when searching for `j`. Refine the query when more than 500 resources match. Search checks all whitespace-separated terms against resource names and their displayed metadata; the list shows progress while checking pages.

If an existing Cloud Run resource or Secret Manager secret is missing from search results, open the action menu and choose **Copy Search Diagnostics** after the search finishes. This action is available even when the result list is empty. It copies the selected project, query, search status, pages and resources checked before filtering, displayed result count, and any unavailable Cloud Run regions. The report contains no authentication tokens. Resource counts describe entries checked, rather than unique resources or the total number in the project.

Cloud Run service searches use the v1 global list at `projects/{project}/locations/-/services` without a `limit`, following the same request used by the Google Cloud CLI. Search follows any continuation token and retains only the best 500 matches. It does not discover or query every supported region. If the global response reports unreachable regions, only those regions are retried through the regional v2 API, with up to six requests in parallel and 500 services per page. Global matches appear while any regional retries are still running. Changing the query or closing the list cancels the previous search's requests.

Service results are fetched again for each query. The initial unfiltered list uses a bounded global snapshot for a quick first load; **Load More** discovers the project's supported regions and fetches one regional page at a time with 50 services per page, even when the snapshot has no continuation token. Regions that remain unavailable after retries are reported while results from other regions remain visible. Diagnostic page counts include all requests checked by a search, including regional retries when needed.

## Supported Services

This extension supports quick navigation to Google Cloud services. For some services, you can also search and navigate directly to resources such as instances, buckets, clusters, jobs, or queues.

Cloud Logging shortcuts are available for selected resource types. The table below shows the current support status for both resource search and Cloud Logging shortcuts.

| Service Name | Category | Resource Search | Cloud Logging Shortcut |
|---|---|---|---|
| Compute Engine | Compute | Instances | Yes |
| Kubernetes Engine | Compute | Clusters | - |
| Cloud Run Services | Compute | Services | Yes |
| Cloud Run Jobs | Compute | Jobs | Yes |
| Cloud Run Worker Pools | Compute | Worker Pools | Yes |
| Cloud Functions | Compute | Functions (gen1) | Yes |
| App Engine | Compute | Services | Yes |
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
| Load Balancing | Networking | Forwarding Rules | - |
| Cloud NAT | Networking | - | - |
| Cloud DNS | Networking | - | - |
| Network Intelligence Center | Networking | - | - |
| IAM & Admin | Security | IAM Policy Bindings | - |
| Service Accounts | Security | Service Accounts | - |
| Workload Identity Federation | Security | Workload Identity Pools | - |
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
| Workflows | Integration | Workflows | Yes |
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

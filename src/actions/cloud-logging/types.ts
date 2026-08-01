export type CloudLoggingTarget =
  | {
      kind: "alloydb-cluster";
      projectId: string;
      clusterId: string;
      region: string;
    }
  | {
      kind: "workflow";
      projectId: string;
      name: string;
      region: string;
    }
  | {
      kind: "cloud-sql-instance";
      projectId: string;
      instanceId: string;
      region: string;
    }
  | {
      kind: "gce-instance";
      projectId: string;
      instanceId: string;
      zone: string;
    }
  | {
      kind: "cloud-function-gen1";
      projectId: string;
      name: string;
      region: string;
    }
  | {
      kind: "cloud-run-job";
      projectId: string;
      name: string;
      region: string;
    }
  | {
      kind: "cloud-run-service";
      projectId: string;
      name: string;
      region: string;
    }
  | {
      kind: "cloud-run-worker-pool";
      projectId: string;
      name: string;
      region: string;
    }
  | {
      kind: "secret-manager-secret";
      projectId: string;
      name: string;
      resourceName: string;
    };

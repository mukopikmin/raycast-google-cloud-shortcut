export type CloudLoggingTarget =
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
    };

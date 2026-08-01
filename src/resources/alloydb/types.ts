import { CloudLoggingTarget } from "../../actions/cloud-logging/types";

export type AlloyDbCluster = {
  id: string;
  clusterId: string;
  name: string;
  displayName?: string;
  region: string;
  state: string;
  url: string;
} & Extract<CloudLoggingTarget, { kind: "alloydb-cluster" }>;

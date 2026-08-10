import { CloudLoggingTarget } from "../../actions/cloud-logging/types";

export type ComputeEngineInstance = {
  id: string;
  name: string;
  status: string;
  zone: string;
  machineType: string;
  internalIp?: string;
  externalIp?: string;
  url: string;
} & Extract<CloudLoggingTarget, { kind: "gce-instance" }>;

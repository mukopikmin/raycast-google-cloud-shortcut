import { CloudLoggingTarget } from "../../actions/cloud-logging/types";

export type SecretManagerSecret = {
  id: string;
  url: string;
} & Extract<CloudLoggingTarget, { kind: "secret-manager-secret" }>;

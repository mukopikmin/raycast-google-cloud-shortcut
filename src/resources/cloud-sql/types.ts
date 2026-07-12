import { CloudLoggingTarget } from "../../actions/cloud-logging/types";

export type CloudSqlInstance = {
  id: string;
  region: string;
  state: string;
  url: string;
} & Extract<CloudLoggingTarget, { kind: "cloud-sql-instance" }>;

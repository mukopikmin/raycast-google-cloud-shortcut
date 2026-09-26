import { Action } from "@raycast/api";
import { createCloudAuditLoggingUrl } from "./createCloudAuditLoggingUrl";
import { CloudLoggingTarget } from "./types";

type Props = {
  target: CloudLoggingTarget;
};

export const OpenCloudAuditLoggingAction = ({ target }: Props) => {
  return (
    <Action.OpenInBrowser
      title="Open Audit Logs"
      url={createCloudAuditLoggingUrl(target)}
      shortcut={{
        macOS: { modifiers: ["cmd", "shift"], key: "l" },
        Windows: { modifiers: ["ctrl", "shift"], key: "l" },
      }}
    />
  );
};

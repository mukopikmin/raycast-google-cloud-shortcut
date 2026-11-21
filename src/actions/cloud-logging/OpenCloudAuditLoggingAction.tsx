import { Action } from "@raycast/api";
import { createCloudAuditLoggingUrl, type CloudAuditLoggingTarget } from "./createCloudAuditLoggingUrl";

type Props = {
  target: CloudAuditLoggingTarget;
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

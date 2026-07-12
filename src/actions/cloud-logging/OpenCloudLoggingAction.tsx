import { Action } from "@raycast/api";
import { createCloudLoggingUrl } from "./createCloudLoggingUrl";
import { CloudLoggingTarget } from "./types";

type Props = {
  target: CloudLoggingTarget;
};

export const OpenCloudLoggingAction = ({ target }: Props) => {
  return (
    <Action.OpenInBrowser
      title="Open Logs"
      url={createCloudLoggingUrl(target)}
      shortcut={{
        macOS: { modifiers: ["cmd"], key: "l" },
        Windows: { modifiers: ["ctrl"], key: "l" },
      }}
    />
  );
};

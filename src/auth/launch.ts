import { launchCommand, LaunchType } from "@raycast/api";
import type { SearchEnabledServiceName } from "../service/types";

export type AuthenticationRequest =
  { type: "refresh-projects" } | { type: "resources"; projectId: string; serviceName: SearchEnabledServiceName };

export type GoogleCloudLaunchContext = { authentication?: AuthenticationRequest };

export const launchAuthenticatedCommand = (authentication: AuthenticationRequest) =>
  launchCommand({
    name: "search-google-cloud-resources",
    type: LaunchType.UserInitiated,
    context: { authentication } satisfies GoogleCloudLaunchContext,
  });

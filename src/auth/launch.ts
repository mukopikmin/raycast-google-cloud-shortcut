import { launchCommand, LaunchType } from "@raycast/api";
import type { SearchEnabledServiceName } from "../service/types";

export type AuthenticationRequest =
  { type: "refresh-projects" } | { type: "resources"; projectId: string; serviceName: SearchEnabledServiceName };

export type GoogleCloudLaunchContext = { authentication?: AuthenticationRequest };

// A fresh command owns the OAuth overlay. Keep only the navigation destination
// for recovering a session that expires while a resource view is already open.
let recoveryRequest: AuthenticationRequest = { type: "refresh-projects" };

export const setAuthenticationRequest = (request?: AuthenticationRequest) => {
  recoveryRequest = request ?? { type: "refresh-projects" };
};

export const launchAuthenticatedCommand = (authentication = recoveryRequest) =>
  launchCommand({
    name: "search-google-cloud-resources",
    type: LaunchType.UserInitiated,
    context: { authentication } satisfies GoogleCloudLaunchContext,
  });

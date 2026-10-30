import { launchCommand, LaunchType } from "@raycast/api";
import type { SearchEnabledServiceName } from "../service/types";

export const RESOURCE_COMMAND = "search-google-cloud-resources";
export const AUTHENTICATION_COMMAND = "authenticate-google-cloud";

export type AuthenticationRequest =
  { type: "refresh-projects" } | { type: "resources"; projectId: string; serviceName: SearchEnabledServiceName };

export type GoogleCloudLaunchContext = { authentication?: AuthenticationRequest; forceSignIn?: boolean };

// The separate authentication command owns the OAuth overlay. Keep the destination
// for recovering a session that expires while a resource view is already open.
let recoveryRequest: AuthenticationRequest = { type: "refresh-projects" };

export const setAuthenticationRequest = (request?: AuthenticationRequest) => {
  recoveryRequest = request ?? { type: "refresh-projects" };
};

export const launchAuthenticatedCommand = (authentication = recoveryRequest, forceSignIn = false) =>
  launchCommand({
    name: AUTHENTICATION_COMMAND,
    type: LaunchType.UserInitiated,
    context: { authentication, ...(forceSignIn ? { forceSignIn: true } : {}) } satisfies GoogleCloudLaunchContext,
  });

export const resumeAuthenticatedCommand = (authentication: AuthenticationRequest) =>
  launchCommand({
    name: RESOURCE_COMMAND,
    type: LaunchType.UserInitiated,
    context: { authentication } satisfies GoogleCloudLaunchContext,
  });

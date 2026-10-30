import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  AUTHENTICATION_COMMAND,
  RESOURCE_COMMAND,
  launchAuthenticatedCommand,
  resumeAuthenticatedCommand,
  setAuthenticationRequest,
} from "./launch";
import manifest from "../../package.json";

const host = vi.hoisted(() => ({
  commandName: "search-google-cloud-resources",
  launch: vi.fn(async (options: { name: string; context?: unknown }) => {
    // Raycast rejects this even though the target command is registered.
    if (options.name === host.commandName) throw new Error("command cannot launch itself");
  }),
}));

vi.mock("@raycast/api", () => ({
  LaunchType: { UserInitiated: "userInitiated" },
  launchCommand: host.launch,
}));

describe("Raycast command launch restrictions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    host.commandName = "search-google-cloud-resources";
    setAuthenticationRequest();
  });

  it("can request authentication from the resource command without launching itself", async () => {
    const request = { type: "resources", projectId: "project", serviceName: "Cloud Run Services" } as const;
    await expect(launchAuthenticatedCommand(request)).resolves.toBeUndefined();
    expect(host.launch).toHaveBeenCalledWith({
      name: "authenticate-google-cloud",
      type: "userInitiated",
      context: { authentication: request },
    });
  });

  it("can refresh projects without launching the resource command itself", async () => {
    await expect(launchAuthenticatedCommand({ type: "refresh-projects" })).resolves.toBeUndefined();
  });

  it("can recover sign-in for the current resource destination without a self-launch", async () => {
    const request = { type: "resources", projectId: "project", serviceName: "Cloud Tasks" } as const;
    setAuthenticationRequest(request);
    await expect(launchAuthenticatedCommand(undefined, true)).resolves.toBeUndefined();
    expect(host.launch).toHaveBeenCalledWith({
      name: "authenticate-google-cloud",
      type: "userInitiated",
      context: { authentication: request, forceSignIn: true },
    });
  });

  it("returns from the authentication command to the requested resource command", async () => {
    host.commandName = AUTHENTICATION_COMMAND;
    const request = { type: "resources", projectId: "project", serviceName: "Cloud Tasks" } as const;
    await expect(resumeAuthenticatedCommand(request)).resolves.toBeUndefined();
    expect(host.launch).toHaveBeenCalledWith({
      name: RESOURCE_COMMAND,
      type: "userInitiated",
      context: { authentication: request },
    });
  });

  it("registers both distinct commands as view commands", () => {
    expect(AUTHENTICATION_COMMAND).not.toBe(RESOURCE_COMMAND);
    for (const name of [RESOURCE_COMMAND, AUTHENTICATION_COMMAND]) {
      expect(manifest.commands.find((command) => command.name === name)?.mode).toBe("view");
    }
  });
});

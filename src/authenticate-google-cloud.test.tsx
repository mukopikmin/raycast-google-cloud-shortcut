import { createElement, type FunctionComponent, type ReactElement } from "react";
import { LaunchType, type launchCommand } from "@raycast/api";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthenticationCommand } from "./authenticate-google-cloud";
import { ErrorDetail } from "./components/ErrorDetail";
import type { GoogleCloudLaunchContext } from "./auth/launch";

const host = vi.hoisted(() => ({
  signedIn: false,
  authorize: vi.fn(),
  launch: vi.fn<typeof launchCommand>(async (options) => {
    if (options.name === "authenticate-google-cloud") throw new Error("command cannot launch itself");
  }),
  pending: undefined as Promise<void> | undefined,
  error: undefined as Error | undefined,
}));

vi.mock("@raycast/api", () => ({
  List: "List",
  LaunchType: { UserInitiated: "userInitiated" },
  launchCommand: host.launch,
  Action: () => null,
  ActionPanel: "ActionPanel",
  Detail: "Detail",
  Icon: {},
}));
vi.mock("./auth/google", () => ({
  withGoogleCommandAccessToken: (component: FunctionComponent) => (props: object) => {
    host.authorize(props);
    return host.signedIn ? createElement(component, props) : createElement("SigningIn");
  },
}));
vi.mock("@raycast/utils", () => ({
  usePromise: (resume: (...args: unknown[]) => Promise<void>, args: unknown[]) => {
    const revalidate = async () => {
      host.error = undefined;
      try {
        await resume(...args);
      } catch (error) {
        host.error = error as Error;
      }
    };
    if (!host.pending) host.pending = revalidate();
    return { error: host.error, revalidate };
  },
}));

const command = (launchContext?: GoogleCloudLaunchContext) =>
  AuthenticationCommand({ launchType: LaunchType.UserInitiated, arguments: undefined, launchContext });
const render = (element: ReactElement) =>
  (element.type as FunctionComponent<object>)(element.props as object) as ReactElement;

describe("separate Google authentication command", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    host.signedIn = false;
    host.pending = undefined;
    host.error = undefined;
  });

  it("waits for sign-in and then returns to the selected resource destination", async () => {
    const request = { type: "resources", projectId: "project", serviceName: "Cloud Tasks" } as const;
    const entry = command({ authentication: request, forceSignIn: true });
    expect(render(entry).type).toBe("SigningIn");
    expect(host.launch).not.toHaveBeenCalled();
    expect(host.authorize).toHaveBeenCalledWith({ request, forceSignIn: true });

    host.signedIn = true;
    const authenticated = render(entry);
    render(authenticated);
    await host.pending;
    expect(host.error).toBeUndefined();
    expect(host.launch).toHaveBeenCalledExactlyOnceWith({
      name: "search-google-cloud-resources",
      type: LaunchType.UserInitiated,
      context: { authentication: request },
    });
  });

  it("refreshes tokens without forcing a fresh login when the caller permits it", () => {
    const request = { type: "refresh-projects" } as const;
    render(command({ authentication: request }));
    expect(host.authorize).toHaveBeenCalledWith({ request, forceSignIn: false });
    expect(host.launch).not.toHaveBeenCalled();
  });

  it("starts fresh sign-in when invoked directly", async () => {
    const entry = command();
    render(entry);
    expect(host.authorize).toHaveBeenCalledWith({ request: { type: "refresh-projects" }, forceSignIn: true });
    host.signedIn = true;
    render(render(entry));
    await host.pending;
    expect(host.launch).toHaveBeenCalledWith({
      name: "search-google-cloud-resources",
      type: LaunchType.UserInitiated,
      context: { authentication: { type: "refresh-projects" } },
    });
  });

  it("shows and retries a return failure without restarting the authentication command", async () => {
    host.signedIn = true;
    const error = new Error("Resource command unavailable");
    host.launch.mockRejectedValueOnce(error);
    const authenticated = render(command());
    render(authenticated);
    await host.pending;
    const failure = render(authenticated) as ReactElement<Parameters<typeof ErrorDetail>[0]>;
    expect(failure.type).toBe(ErrorDetail);
    expect(failure.props.error).toBe(error);
    await failure.props.onRetry!();
    expect(host.error).toBeUndefined();
    expect(host.launch).toHaveBeenCalledTimes(2);
    expect(host.launch.mock.calls.every(([options]) => options.name === "search-google-cloud-resources")).toBe(true);
  });
});

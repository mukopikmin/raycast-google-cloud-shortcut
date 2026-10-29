import {
  Children,
  createElement,
  isValidElement,
  type FunctionComponent,
  type ReactElement,
  type ReactNode,
} from "react";
import { LaunchType, type launchCommand } from "@raycast/api";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Command } from "./search-google-cloud-resources";
import { ProjectList } from "./resources/project/ProjectList";
import { ServiceList } from "./service/ServiceList";
import { ErrorDetail } from "./components/ErrorDetail";
import { GoogleAuthenticationRequiredError } from "./auth/GoogleAuthenticationRequiredError";
import type { GoogleCloudLaunchContext } from "./auth/launch";

const mocks = vi.hoisted(() => ({
  authorize: vi.fn(),
  launch: vi.fn<typeof launchCommand>(async () => undefined),
  push: vi.fn(),
  effects: [] as (() => void)[],
  restored: { current: false },
}));

vi.mock("react", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react")>()),
  useEffect: (effect: () => void) => mocks.effects.push(effect),
  useRef: () => mocks.restored,
  useState: () => [undefined, vi.fn()],
}));
vi.mock("@raycast/api", () => ({
  Action: Object.assign("Action", { OpenInBrowser: "OpenInBrowser" }),
  ActionPanel: "ActionPanel",
  List: Object.assign("List", { Item: "Item" }),
  Detail: "Detail",
  Icon: {},
  LaunchType: { UserInitiated: "userInitiated" },
  launchCommand: mocks.launch,
  useNavigation: () => ({ push: mocks.push }),
}));
vi.mock("./auth/google", () => ({
  withGoogleCommandAccessToken: (component: FunctionComponent) => (props: object) => {
    mocks.authorize();
    return createElement(component, props);
  },
}));
vi.mock("./resources/project/ProjectList", () => ({ ProjectList: () => null }));
vi.mock("./service/useServiceResource", () => ({
  useServiceResource: (projectId: string) => ({
    services: [
      { name: "Cloud Run Services", isSearchEnabled: true, keywords: [], target: { resource: "services", projectId } },
      { name: "Cloud Tasks", isSearchEnabled: true, keywords: [], target: { resource: "regions", projectId } },
      { name: "BigQuery", isSearchEnabled: false, keywords: [], url: "https://console.cloud.google.com/bigquery" },
    ],
  }),
}));

type ActionProps = { children?: ReactNode; actions?: ReactNode; title?: string; onAction?: () => Promise<void> };
const elements = (node: ReactNode): ReactElement<ActionProps>[] =>
  Children.toArray(node).flatMap((child) =>
    isValidElement<ActionProps>(child)
      ? [child, ...elements(child.props.children), ...elements(child.props.actions)]
      : [],
  );

const command = (launchContext?: GoogleCloudLaunchContext) =>
  Command({ launchType: LaunchType.UserInitiated, arguments: undefined, launchContext });
const render = (element: ReactElement) =>
  (element.type as FunctionComponent<object>)(element.props as object) as ReactElement;
const flushEffects = () => mocks.effects.splice(0).forEach((effect) => effect());

describe("OAuth at the command entry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.authorize.mockReset();
    mocks.effects.length = 0;
    mocks.restored.current = false;
    command();
  });

  it("opens cached projects and service types without starting authentication", () => {
    expect(command().type).toBe(ProjectList);
    const actions = elements(ServiceList({ projectId: "project-1" }));
    expect(actions.filter(({ type }) => type === "OpenInBrowser")).toHaveLength(3);
    expect(actions.filter(({ props }) => props.onAction)).toHaveLength(2);
    expect(mocks.authorize).not.toHaveBeenCalled();
    expect(mocks.launch).not.toHaveBeenCalled();
  });

  it.each([
    ["Cloud Run Services", "services"],
    ["Cloud Tasks", "regions"],
  ] as const)("relaunches at the root before opening %s", async (name, resource) => {
    const action = elements(ServiceList({ projectId: "project-1" })).find(
      ({ props }) => props.title === `Show ${name} Resources`,
    );
    await action?.props.onAction?.();
    expect(mocks.launch).toHaveBeenCalledWith({
      name: "search-google-cloud-resources",
      type: LaunchType.UserInitiated,
      context: { authentication: { type: "resources", projectId: "project-1", serviceName: name } },
    });
    expect(mocks.push).not.toHaveBeenCalled();
    expect(mocks.authorize).not.toHaveBeenCalled();

    const entry = command({ authentication: { type: "resources", projectId: "project-1", serviceName: name } });
    const authenticated = render(entry);
    expect(mocks.authorize).toHaveBeenCalledOnce();
    expect(mocks.push).not.toHaveBeenCalled();
    expect(render(authenticated).type).toBe(ProjectList);
    flushEffects();
    expect(mocks.push).toHaveBeenCalledTimes(2);
    expect(mocks.push.mock.calls[0][0]).toMatchObject({ type: ServiceList, props: { projectId: "project-1" } });
    expect(mocks.push.mock.calls[1][0]).toEqual({ resource, projectId: "project-1" });
    render(authenticated);
    flushEffects();
    expect(mocks.push).toHaveBeenCalledTimes(2);
  });

  it("keeps the requested destination for sign-in after a session expires in an open list", async () => {
    const request = { type: "resources", projectId: "project-1", serviceName: "Cloud Run Services" } as const;
    command({ authentication: request });
    const actions = elements(ErrorDetail({ error: new GoogleAuthenticationRequiredError() }));
    await actions.find(({ props }) => props.title === "Sign in to Google")!.props.onAction!();
    expect(mocks.launch).toHaveBeenCalledWith({
      name: "search-google-cloud-resources",
      type: LaunchType.UserInitiated,
      context: { authentication: request },
    });
    expect(mocks.authorize).not.toHaveBeenCalled();
  });

  it("refreshes projects only after command-level authentication", () => {
    const authenticated = render(command({ authentication: { type: "refresh-projects" } }));
    expect(mocks.authorize).toHaveBeenCalledOnce();
    expect(render(authenticated).props).toEqual({ refreshOnLoad: true });
    flushEffects();
    expect(mocks.push).not.toHaveBeenCalled();
  });

  it("resets the recovery destination for a normal command launch", async () => {
    command({ authentication: { type: "resources", projectId: "previous", serviceName: "Cloud Tasks" } });
    command();
    const actions = elements(ErrorDetail({ error: new GoogleAuthenticationRequiredError() }));
    await actions.find(({ props }) => props.title === "Sign in to Google")!.props.onAction!();
    expect(mocks.launch).toHaveBeenCalledWith({
      name: "search-google-cloud-resources",
      type: LaunchType.UserInitiated,
      context: { authentication: { type: "refresh-projects" } },
    });
  });
});

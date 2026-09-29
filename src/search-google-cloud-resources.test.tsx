import {
  Children,
  createElement,
  isValidElement,
  type FunctionComponent,
  type ReactElement,
  type ReactNode,
} from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Command } from "./search-google-cloud-resources";
import { ProjectList } from "./resources/project/ProjectList";
import { ServiceList } from "./service/ServiceList";
import type { GoogleCloudLaunchContext } from "./auth/launch";
import { LaunchType, type launchCommand } from "@raycast/api";

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
  withGoogleAccessToken: (component: FunctionComponent) => (props: object) => {
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

describe("authentication at the resource boundary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.authorize.mockReset();
    mocks.effects.length = 0;
    mocks.restored.current = false;
  });

  it("opens projects and service types without starting authentication", () => {
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
  ])("authenticates before restoring the selected %s view", async (name, resource) => {
    const action = elements(ServiceList({ projectId: "project-1" })).find(
      ({ props }) => props.title === `Show ${name} Resources`,
    );
    await action?.props.onAction?.();
    expect(mocks.launch).toHaveBeenCalledWith({
      name: "search-google-cloud-resources",
      type: LaunchType.UserInitiated,
      context: { authentication: { type: "resources", projectId: "project-1", serviceName: name } },
    });
    const entry = command(mocks.launch.mock.calls[0][0].context as GoogleCloudLaunchContext);
    const pending = new Promise(() => {});
    mocks.authorize.mockImplementationOnce(() => {
      throw pending;
    });
    let suspended: unknown;
    try {
      render(entry);
    } catch (error) {
      suspended = error;
    }
    expect(suspended).toBe(pending);
    expect(mocks.push).not.toHaveBeenCalled();

    const authenticated = render(entry);
    expect(render(authenticated).type).toBe(ProjectList);
    flushEffects();
    expect(mocks.push).toHaveBeenCalledTimes(2);
    expect(mocks.push.mock.calls[0][0]).toMatchObject({ type: ServiceList, props: { projectId: "project-1" } });
    expect(mocks.push.mock.calls[1][0]).toEqual({ resource, projectId: "project-1" });
    render(authenticated);
    flushEffects();
    expect(mocks.push).toHaveBeenCalledTimes(2);
  });

  it("refreshes projects only through the authenticated entry", () => {
    const authenticated = render(command({ authentication: { type: "refresh-projects" } }));
    expect(mocks.authorize).toHaveBeenCalledOnce();
    expect(render(authenticated).props).toEqual({ refreshOnLoad: true });
    flushEffects();
    expect(mocks.push).not.toHaveBeenCalled();
  });
});

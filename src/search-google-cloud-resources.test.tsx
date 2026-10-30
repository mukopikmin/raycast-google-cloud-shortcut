import { Children, isValidElement, type ReactElement, type ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import manifest from "../package.json";
import { Command } from "./search-google-cloud-resources";
import { ProjectList } from "./resources/project/ProjectList";
import { ServiceList } from "./service/ServiceList";

const host = vi.hoisted(() => ({
  launch: vi.fn(async () => {
    throw new Error("command cannot launch itself");
  }),
}));
vi.mock("@raycast/api", () => ({
  Action: Object.assign(() => null, { Push: "Push", OpenInBrowser: "OpenInBrowser" }),
  ActionPanel: "ActionPanel",
  List: Object.assign(() => null, { Item: "Item" }),
  Icon: {},
  launchCommand: host.launch,
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

type ActionProps = { children?: ReactNode; actions?: ReactNode; title?: string; target?: unknown };
const elements = (node: ReactNode): ReactElement<ActionProps>[] =>
  Children.toArray(node).flatMap((child) =>
    isValidElement<ActionProps>(child)
      ? [child, ...elements(child.props.children), ...elements(child.props.actions)]
      : [],
  );

describe("single resource command", () => {
  it("registers only the resource search command", () => {
    expect(manifest.commands.map(({ name }) => name)).toEqual(["search-google-cloud-resources"]);
  });

  it("opens projects without launching another command", () => {
    expect(Command().type).toBe(ProjectList);
    expect(host.launch).not.toHaveBeenCalled();
  });

  it.each([
    ["Cloud Run Services", "services"],
    ["Cloud Tasks", "regions"],
  ])("pushes the %s view in the existing navigation stack", (name, resource) => {
    const actions = elements(ServiceList({ projectId: "project" }));
    const action = actions.find(({ props }) => props.title === `Show ${name} Resources`);
    expect(action).toMatchObject({ type: "Push", props: { target: { resource, projectId: "project" } } });
    expect(host.launch).not.toHaveBeenCalled();
    expect(actions.filter(({ type }) => type === "OpenInBrowser")).toHaveLength(3);
  });
});

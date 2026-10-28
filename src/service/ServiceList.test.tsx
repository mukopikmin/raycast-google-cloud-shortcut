import { Children, type ReactElement, type ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { ServiceList } from "./ServiceList";
import { CloudFunctionList } from "../resources/cloud-functions/CloudFunctionList";

vi.mock("@raycast/api", () => ({
  Action: { Push: "Push", OpenInBrowser: "OpenInBrowser" },
  ActionPanel: "ActionPanel",
  List: Object.assign("List", { Item: "Item" }),
  Icon: {},
  Color: {},
}));
vi.mock("@raycast/utils", () => ({ usePromise: vi.fn() }));
vi.mock("../auth/google", () => ({ withGoogleAccessToken: (component: unknown) => component }));

type ItemProps = {
  title: string;
  keywords: string[];
  actions: ReactElement<{ children: ReactNode }>;
};
type ActionProps = { url?: string; target?: ReactElement<{ projectId: string }> };

const renderItems = () => {
  const list = ServiceList({ projectId: "selected-project" });
  return Children.toArray(list.props.children) as ReactElement<ItemProps>[];
};

describe("service navigation after product renaming", () => {
  it.each([
    ["Cloud Run functions (1st gen)", "Cloud Functions", "/functions"],
    ["Managed Service for Apache Spark (Dataproc Clusters)", "Dataproc", "/dataproc/clusters"],
    ["Managed Service for Apache Airflow", "Composer", "/composer"],
    ["Knowledge Catalog", "Dataplex", "/dataplex"],
    ["Gemini Enterprise Agent Platform", "Vertex AI", "/vertex-ai"],
  ])("keeps %s searchable by %s and opens the selected project", (name, formerName, path) => {
    const item = renderItems().find(({ props }) => props.title === name);
    expect(item).toBeDefined();
    expect(item!.props.keywords).toEqual(expect.arrayContaining([name, formerName]));
    const actions = Children.toArray(item!.props.actions.props.children) as ReactElement<ActionProps>[];
    const open = actions.find((action) => action.type === "OpenInBrowser");
    expect(open?.props.url).toBe(`https://console.cloud.google.com${path}?project=selected-project`);
  });

  it("still opens the first-generation functions list with the selected project", () => {
    const item = renderItems().find(({ props }) => props.title === "Cloud Run functions (1st gen)");
    const actions = Children.toArray(item!.props.actions.props.children) as ReactElement<ActionProps>[];
    const target = actions.find((action) => action.type === "Push")?.props.target;
    expect(target?.type).toBe(CloudFunctionList);
    expect(target?.props.projectId).toBe("selected-project");
  });
});

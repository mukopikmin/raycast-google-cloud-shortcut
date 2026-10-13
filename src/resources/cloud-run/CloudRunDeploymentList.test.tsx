import { Children, isValidElement, type ReactElement, type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CloudRunDeploymentList, type CloudRunDeploymentListResult } from "./CloudRunDeploymentList";
import { CloudRunServicesList } from "./CloudRunServicesList";
import { useCloudRunServices } from "./useCloudRunServices";
import { createCloudRunDeployment } from "./types";
import { SearchDiagnosticsAction } from "../../components/SearchDiagnosticsAction";

vi.mock("react", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react")>()),
  useState: () => ["missing-service", vi.fn()],
}));
vi.mock("@raycast/api", () => ({
  Action: Object.assign("Action", {
    OpenInBrowser: "OpenInBrowser",
    CopyToClipboard: "CopyToClipboard",
    Push: "Push",
  }),
  ActionPanel: "ActionPanel",
  List: Object.assign("List", { Item: "Item", EmptyView: "EmptyView" }),
  Icon: {},
}));
vi.mock("../../auth/google", () => ({ withGoogleAccessToken: (component: unknown) => component }));
vi.mock("./useCloudRunServices", () => ({ useCloudRunServices: vi.fn() }));

type ElementProps = {
  id?: string;
  children?: ReactNode;
  actions?: ReactNode;
  target?: ReactElement<{ error: Error }>;
  keywords?: string[];
  onAction?: () => Promise<void>;
  title?: string;
};

const elements = (node: ReactNode): ReactElement<ElementProps>[] =>
  Children.toArray(node).flatMap((child) =>
    isValidElement<ElementProps>(child)
      ? [child, ...elements(child.props.children), ...elements(child.props.actions)]
      : [],
  );

const service = createCloudRunDeployment({
  id: "service-1",
  name: "loaded-service",
  projectId: "project-1",
  region: "us-central1",
  deployType: "Container Services",
  url: "https://example.com/service",
});

const result: CloudRunDeploymentListResult = {
  deployments: [service],
  isLoading: false,
  isLoadingMore: false,
  hasMore: true,
  isTruncated: false,
  loadMore: vi.fn(async () => undefined),
  error: undefined,
};

describe("Cloud Run partial service results", () => {
  beforeEach(() => vi.clearAllMocks());

  it("keeps loaded services, unavailable region details, and explicit pagination together", async () => {
    vi.mocked(useCloudRunServices).mockReturnValue({
      ...result,
      services: [service],
      resources: [service],
      isSearching: false,
      pagesSearched: 0,
      resourcesSearched: 0,
      nextPageToken: "page-2",
      unreachable: ["europe-west1"],
      reload: vi.fn(async () => undefined),
    });
    const servicesList = CloudRunServicesList({ projectId: "project-1" }) as ReactElement<
      Parameters<typeof CloudRunDeploymentList>[0]
    >;
    const rendered = elements(CloudRunDeploymentList(servicesList.props));
    expect(rendered.some(({ props }) => props.id === service.id)).toBe(true);
    const warning = rendered.find(({ props }) => props.id === "cloud-run-services-unreachable");
    expect(warning?.props.keywords).toEqual(["missing-service"]);
    const details = elements(warning?.props.actions).find(({ props }) => props.target);
    expect(details?.props.target?.props.error.message).toContain("europe-west1");
    const more = rendered.find(({ props }) => props.id === "load-more-cloud-run-services");
    expect(more?.props.keywords).toEqual(["missing-service"]);
    expect(result.loadMore).not.toHaveBeenCalled();
    await elements(more?.props.actions)
      .find(({ props }) => props.onAction)
      ?.props.onAction?.();
    expect(result.loadMore).toHaveBeenCalledOnce();
  });

  it("omits the region warning for lists without unavailable regions", () => {
    const rendered = elements(CloudRunDeploymentList({ ...result, resourceName: "Jobs" }));
    expect(rendered.some(({ props }) => props.id === "cloud-run-services-unreachable")).toBe(false);
  });

  it("keeps load more and reload available while older results are omitted", async () => {
    const reload = vi.fn(async () => undefined);
    const rendered = elements(
      CloudRunDeploymentList({ ...result, resourceName: "Services", isTruncated: true, reload }),
    );
    expect(rendered.find(({ props }) => props.id === "cloud-run-services-truncated")?.props.keywords).toEqual([
      "missing-service",
    ]);
    const more = rendered.find(({ props }) => props.id === "load-more-cloud-run-services");
    expect(more?.props.keywords).toEqual(["missing-service"]);
    await elements(more?.props.actions)
      .find(({ props }) => props.onAction)
      ?.props.onAction?.();
    expect(result.loadMore).toHaveBeenCalledOnce();
    await rendered.find(({ props }) => props.title === "Reload from Start")?.props.onAction?.();
    expect(reload).toHaveBeenCalledOnce();
  });

  it("offers a restart after reaching the last page beyond 500 services", () => {
    const rendered = elements(
      CloudRunDeploymentList({
        ...result,
        resourceName: "Services",
        hasMore: false,
        isTruncated: true,
        reload: vi.fn(async () => undefined),
      }),
    );
    expect(rendered.some(({ props }) => props.id === "load-more-cloud-run-services")).toBe(false);
    expect(rendered.some(({ props }) => props.title === "Reload from Start")).toBe(true);
  });

  it("exposes the project, checked counts, and unavailable regions even when no service matches", () => {
    const rendered = elements(
      CloudRunDeploymentList({
        ...result,
        projectId: "project-1",
        resourceName: "Services",
        searchText: "journal",
        deployments: [],
        hasMore: false,
        pagesSearched: 13,
        resourcesSearched: 620,
        unreachable: ["asia-northeast1"],
      }),
    );
    const action = rendered.find((element) => element.type === SearchDiagnosticsAction) as
      ReactElement<Parameters<typeof SearchDiagnosticsAction>[0]> | undefined;
    expect(action).toBeDefined();
    const diagnostics = JSON.parse(SearchDiagnosticsAction(action!.props).props.content);
    expect(diagnostics).toMatchObject({
      projectId: "project-1",
      query: "journal",
      status: "complete",
      pagesChecked: 13,
      resourcesChecked: 620,
      displayedResults: 0,
      hasNextPage: false,
      unavailableRegions: ["asia-northeast1"],
    });
    expect(rendered.some(({ props }) => props.id === "cloud-run-search-progress")).toBe(false);
  });
});

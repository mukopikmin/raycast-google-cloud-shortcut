import { Children, isValidElement, type ReactElement, type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CloudRunDeploymentList, type CloudRunDeploymentListResult } from "./CloudRunDeploymentList";
import { CloudRunServicesList } from "./CloudRunServicesList";
import { useCloudRunServices } from "./useCloudRunServices";
import { createCloudRunDeployment } from "./types";

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
      nextPageToken: "page-2",
      unreachable: ["europe-west1"],
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

  it("keeps the truncation notice searchable and stops loading at the cap", () => {
    const rendered = elements(
      CloudRunDeploymentList({ ...result, resourceName: "Services", hasMore: false, isTruncated: true }),
    );
    expect(rendered.find(({ props }) => props.id === "cloud-run-services-truncated")?.props.keywords).toEqual([
      "missing-service",
    ]);
    expect(rendered.some(({ props }) => props.onAction)).toBe(false);
  });
});

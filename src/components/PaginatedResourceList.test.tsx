import { Children, isValidElement, type ReactElement, type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PaginatedResourceList } from "./PaginatedResourceList";
import { SecretManagerList } from "../resources/secret-manager/SecretManagerList";
import { useSecretManager } from "../resources/secret-manager/useSecretManager";

vi.mock("react", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react")>()),
  useState: () => ["secret-619", vi.fn()],
}));
vi.mock("@raycast/api", () => ({
  Action: Object.assign("Action", { OpenInBrowser: "OpenInBrowser", CopyToClipboard: "CopyToClipboard" }),
  ActionPanel: "ActionPanel",
  List: Object.assign("List", { Item: "Item", EmptyView: "EmptyView" }),
  Icon: {},
}));
vi.mock("../auth/google", () => ({ withGoogleAccessToken: (component: unknown) => component }));
vi.mock("../resources/secret-manager/useSecretManager", () => ({ useSecretManager: vi.fn() }));

type Props = {
  id?: string;
  title?: string;
  keywords?: string[];
  children?: ReactNode;
  actions?: ReactNode;
  onAction?: () => Promise<void>;
};
const elements = (node: ReactNode): ReactElement<Props>[] =>
  Children.toArray(node).flatMap((child) =>
    isValidElement<Props>(child) ? [child, ...elements(child.props.children), ...elements(child.props.actions)] : [],
  );

const loadMore = vi.fn(async () => undefined);
const reload = vi.fn(async () => undefined);
const secrets = [
  {
    id: "secret-619",
    name: "secret-619",
    kind: "secret-manager-secret" as const,
    projectId: "project",
    resourceName: "projects/project/secrets/secret-619",
    url: "https://example.com",
  },
];
const result: ReturnType<typeof useSecretManager> = {
  secrets,
  resources: secrets,
  nextPageToken: "page-14",
  isLoading: false,
  isLoadingMore: false,
  isSearching: false,
  pagesSearched: 0,
  hasMore: true,
  isTruncated: true,
  loadMore,
  reload,
  error: undefined,
};

describe("Secret Manager pagination controls", () => {
  beforeEach(() => vi.clearAllMocks());

  const renderList = (state = result) => {
    vi.mocked(useSecretManager).mockReturnValue(state);
    const list = SecretManagerList({ projectId: "project" }) as ReactElement<
      Parameters<typeof PaginatedResourceList>[0]
    >;
    return elements(PaginatedResourceList(list.props));
  };

  it("keeps load more and the omission notice searchable beyond 500", async () => {
    const rendered = renderList();
    expect(rendered.some(({ props }) => props.id === "secret-619")).toBe(true);
    const more = rendered.find(({ props }) => props.id === "load-more-resources");
    expect(more?.props.keywords).toEqual(["secret-619"]);
    const notice = rendered.find(({ props }) => props.id === "resources-truncated");
    expect(notice?.props.keywords).toEqual(["secret-619"]);
    expect(loadMore).not.toHaveBeenCalled();
    await elements(more?.props.actions)
      .find(({ props }) => props.title === "Load More Secrets")
      ?.props.onAction?.();
    expect(loadMore).toHaveBeenCalledOnce();
    await elements(notice?.props.actions)
      .find(({ props }) => props.title === "Reload from Start")
      ?.props.onAction?.();
    expect(reload).toHaveBeenCalledOnce();
  });

  it("keeps restart available after the last page", () => {
    const rendered = renderList({ ...result, hasMore: false, nextPageToken: undefined });
    expect(rendered.some(({ props }) => props.id === "load-more-resources")).toBe(false);
    expect(rendered.some(({ props }) => props.title === "Reload from Start")).toBe(true);
  });

  it("passes the search text to the Secret Manager hook and shows progress instead of no matches", () => {
    const rendered = renderList({
      ...result,
      secrets: [],
      resources: [],
      isLoading: true,
      isSearching: true,
      pagesSearched: 8,
    });
    expect(useSecretManager).toHaveBeenCalledWith("project", "secret-619");
    expect(rendered.some(({ props }) => props.id === "resource-search-progress")).toBe(true);
    expect(rendered.some(({ props }) => props.title?.startsWith("No "))).toBe(false);
  });
});

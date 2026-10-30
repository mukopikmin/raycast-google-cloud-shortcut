import type { OAuth } from "@raycast/api";
import { Children, isValidElement, type ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ErrorDetail } from "../components/ErrorDetail";
import { refreshGoogleAccessToken, useGoogleApi, withGoogleAccessToken } from "./google";
import { GoogleAuthenticationContext } from "./GoogleAuthenticationContext";
import { GoogleAuthenticationRequiredError } from "./GoogleAuthenticationRequiredError";
import { GoogleApiError } from "./GoogleApiError";

const provider = vi.hoisted(() => ({
  client: { getTokens: vi.fn(), setTokens: vi.fn(), removeTokens: vi.fn() },
  authorize: vi.fn(),
  launch: vi.fn(async () => {
    throw new Error("command cannot launch itself");
  }),
}));

// Exercise view recovery with the real session, without the native Raycast host.
const runtime = vi.hoisted(() => {
  let state: { isLoading: boolean; data?: unknown; error?: Error };
  let pending: Promise<void> | undefined;
  let signInAttempt: number | undefined;
  let previousAttempt: number | undefined;
  let recover: (() => Promise<void>) | undefined;
  return {
    reset: () => {
      state = { isLoading: true };
      pending = undefined;
      signInAttempt = undefined;
      previousAttempt = undefined;
      recover = undefined;
    },
    settle: () => pending,
    setRecovery: (callback: () => Promise<void>) => {
      recover = callback;
    },
    getRecovery: () => recover,
    useState: (initial: number) => {
      signInAttempt ??= initial;
      return [
        signInAttempt,
        (update: (attempt: number) => number) => {
          signInAttempt = update(signInAttempt!);
        },
      ];
    },
    usePromise: (authorize: (attempt: number) => Promise<unknown>, [attempt]: [number]) => {
      const revalidate = () => {
        state = { isLoading: true };
        pending = authorize(attempt).then(
          (data) => {
            state = { isLoading: false, data };
          },
          (error: Error) => {
            state = { isLoading: false, error };
          },
        );
        return pending;
      };
      if (!pending || previousAttempt !== attempt) {
        previousAttempt = attempt;
        revalidate();
      }
      return { ...state, revalidate };
    },
  };
});
vi.mock("react", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react")>()),
  useState: runtime.useState,
  useCallback: (callback: unknown) => callback,
  useContext: runtime.getRecovery,
}));
vi.mock("./authorize", () => ({
  GOOGLE_SCOPE: "https://www.googleapis.com/auth/cloud-platform",
  createGoogleAuthorization: () => provider.authorize,
}));
vi.mock("@raycast/utils", () => ({ OAuthService: { google: () => provider }, usePromise: runtime.usePromise }));
vi.mock("@raycast/api", () => ({
  List: "List",
  Detail: "Detail",
  Action: "Action",
  ActionPanel: "ActionPanel",
  Icon: {},
  launchCommand: provider.launch,
}));

const tokenSet = (accessToken = "valid-access", expired = false) =>
  ({ accessToken, refreshToken: "refresh", isExpired: () => expired }) as OAuth.TokenSet;
const ResourceList = ({ projectId }: { projectId: string }) => <>{`${projectId}:${useGoogleApi().accessToken}`}</>;
const WrappedList = withGoogleAccessToken(ResourceList);
const render = () => {
  const view = WrappedList({ projectId: "project" });
  if (view.type === GoogleAuthenticationContext.Provider) {
    runtime.setRecovery(view.props.value);
    return view.props.children as typeof view;
  }
  return view;
};
const getActions = (props: Parameters<typeof ErrorDetail>[0]) =>
  Children.toArray(ErrorDetail(props).props.actions?.props.children).filter(
    (node): node is ReactElement<{ title: string; onAction: () => Promise<void> }> => isValidElement(node),
  );
const fetchMock = vi.fn<typeof fetch>();

describe("authentication in the current resource view", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    runtime.reset();
    provider.client.getTokens.mockResolvedValue(tokenSet());
    vi.stubGlobal("fetch", fetchMock);
  });
  afterEach(() => vi.unstubAllGlobals());

  it("waits for authorization before mounting resources and preserves view props", async () => {
    expect(render()).toMatchObject({ type: "List", props: { isLoading: true } });
    await runtime.settle();
    expect(render()).toMatchObject({ type: ResourceList, props: { projectId: "project" } });
    expect(ResourceList(render().props).props.children).toBe("project:valid-access");
    expect(provider.authorize).not.toHaveBeenCalled();
    expect(provider.launch).not.toHaveBeenCalled();
  });

  it("recovers an expired session in the selected view without logging out or launching a command", async () => {
    provider.client.getTokens.mockResolvedValue(tokenSet("expired", true));
    fetchMock.mockResolvedValueOnce(
      Response.json({ error: "invalid_grant", error_subtype: "invalid_rapt" }, { status: 400 }),
    );
    provider.authorize.mockResolvedValueOnce("reauthorized-access");
    render();
    await runtime.settle();
    expect(render().type).toBe(ResourceList);
    expect(useGoogleApi().accessToken).toBe("reauthorized-access");
    expect(provider.authorize).toHaveBeenCalledOnce();
    expect(provider.client.removeTokens).not.toHaveBeenCalled();
    expect(provider.launch).not.toHaveBeenCalled();
  });

  it("retries token refresh after a network failure", async () => {
    provider.client.getTokens.mockResolvedValue(tokenSet("expired", true));
    fetchMock.mockRejectedValueOnce(new Error("Network unavailable"));
    render();
    await runtime.settle();
    const failure = render() as ReactElement<Parameters<typeof ErrorDetail>[0]>;
    expect(failure.type).toBe(ErrorDetail);
    expect(failure.props.error.message).toBe("Network unavailable");
    fetchMock.mockResolvedValueOnce(Response.json({ access_token: "recovered" }));
    await getActions(failure.props)
      .find(({ props }) => props.title === "Retry")!
      .props.onAction();
    expect(render().type).toBe(ResourceList);
    expect(useGoogleApi().accessToken).toBe("recovered");
    expect(provider.launch).not.toHaveBeenCalled();
  });

  it("can start a new sign-in after cancellation in the same view", async () => {
    provider.client.getTokens.mockResolvedValue(undefined);
    provider.authorize.mockRejectedValueOnce(new Error("Authorization cancelled"));
    render();
    await runtime.settle();
    const failure = render() as ReactElement<Parameters<typeof ErrorDetail>[0]>;
    expect(failure.props.error.message).toBe("Authorization cancelled");
    provider.authorize.mockResolvedValueOnce("new-login");
    await getActions(failure.props)
      .find(({ props }) => props.title === "Sign in to Google")!
      .props.onAction();
    expect(render()).toMatchObject({ type: "List", props: { isLoading: true } });
    await runtime.settle();
    expect(render().type).toBe(ResourceList);
    expect(useGoogleApi().accessToken).toBe("new-login");
    expect(provider.client.removeTokens).not.toHaveBeenCalled();
    expect(provider.launch).not.toHaveBeenCalled();
  });

  it("recovers an API-rejected token through the current view's authentication context", async () => {
    render();
    await runtime.settle();
    render();
    fetchMock.mockResolvedValueOnce(Response.json({ error: "invalid_grant" }, { status: 400 }));
    let failure: Error | undefined;
    try {
      await refreshGoogleAccessToken("valid-access");
    } catch (error) {
      failure = error as Error;
    }
    expect(failure).toBeInstanceOf(GoogleAuthenticationRequiredError);
    provider.authorize.mockResolvedValueOnce("fresh-access");
    await getActions({ error: failure! })[0].props.onAction();
    expect(render()).toMatchObject({ type: "List", props: { isLoading: true } });
    await runtime.settle();
    expect(render()).toMatchObject({ type: ResourceList, props: { projectId: "project" } });
    expect(useGoogleApi().accessToken).toBe("fresh-access");
    expect(provider.authorize).toHaveBeenCalledOnce();
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(provider.launch).not.toHaveBeenCalled();
  });

  it("allows fresh sign-in when stored credentials cannot be read", async () => {
    provider.client.getTokens.mockRejectedValueOnce(new Error("Stored tokens unavailable"));
    render();
    await runtime.settle();
    const failure = render() as ReactElement<Parameters<typeof ErrorDetail>[0]>;
    provider.authorize.mockResolvedValueOnce("fresh-access");
    await getActions(failure.props)[0].props.onAction();
    render();
    await runtime.settle();
    expect(render().type).toBe(ResourceList);
    expect(provider.client.getTokens).toHaveBeenCalledOnce();
    expect(provider.launch).not.toHaveBeenCalled();
  });

  it("does not offer sign-in for permission errors even inside an authenticated view", async () => {
    render();
    await runtime.settle();
    render();
    expect(getActions({ error: new GoogleApiError(403, "Forbidden") })).toEqual([]);
    expect(provider.launch).not.toHaveBeenCalled();
  });
});

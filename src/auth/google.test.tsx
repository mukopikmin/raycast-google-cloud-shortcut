import type { OAuth } from "@raycast/api";
import type { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ErrorDetail } from "../components/ErrorDetail";
import { refreshGoogleAccessToken, useGoogleApi, withGoogleAccessToken, withGoogleCommandAccessToken } from "./google";
import { GoogleAuthenticationRequiredError } from "./GoogleAuthenticationRequiredError";

const provider = vi.hoisted(() => ({
  client: { getTokens: vi.fn(), setTokens: vi.fn(), removeTokens: vi.fn() },
  authorize: vi.fn(),
}));

// Model usePromise's loading/error/data lifecycle without the Raycast host.
// Authorization itself uses the real session implementation.
const runtime = vi.hoisted(() => {
  let state: { isLoading: boolean; data?: string; error?: Error };
  let pending: Promise<void> | undefined;
  return {
    reset: () => {
      state = { isLoading: true };
      pending = undefined;
    },
    settle: () => pending,
    usePromise: (authorize: () => Promise<string>) => {
      const revalidate = () => {
        state = { isLoading: true };
        pending = authorize().then(
          (data) => {
            state = { isLoading: false, data };
          },
          (error: Error) => {
            state = { isLoading: false, error };
          },
        );
        return pending;
      };
      if (!pending) revalidate();
      return { ...state, revalidate };
    },
  };
});

vi.mock("@raycast/utils", () => ({
  OAuthService: { google: () => provider },
  usePromise: runtime.usePromise,
}));
vi.mock("@raycast/api", () => ({
  List: "List",
  Detail: "Detail",
  Action: "Action",
  ActionPanel: "ActionPanel",
  Icon: { ArrowClockwise: "ArrowClockwise" },
}));

const tokenSet = (accessToken = "valid-access", expired = false) =>
  ({ accessToken, refreshToken: "refresh", isExpired: () => expired }) as OAuth.TokenSet;

const ResourceList = ({ projectId }: { projectId: string }) => <>{`${projectId}:${useGoogleApi().accessToken}`}</>;
const WrappedList = withGoogleAccessToken(ResourceList);
const WrappedCommand = withGoogleCommandAccessToken(ResourceList);
const render = () => WrappedList({ projectId: "project" });
const renderCommand = () => WrappedCommand({ projectId: "project" });
const fetchMock = vi.fn<typeof fetch>();

describe("resource list authorization", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    runtime.reset();
    provider.client.getTokens.mockResolvedValue(tokenSet());
    vi.stubGlobal("fetch", fetchMock);
  });
  afterEach(() => vi.unstubAllGlobals());

  it("waits for authorization before rendering resources and preserves props", async () => {
    expect(render()).toMatchObject({ type: "List", props: { isLoading: true } });
    await runtime.settle();
    expect(render()).toMatchObject({ type: ResourceList, props: { projectId: "project" } });
    expect(ResourceList(render().props).props.children).toBe("project:valid-access");
    expect(provider.authorize).not.toHaveBeenCalled();
  });

  it("shows an authentication failure inside the extension and retries from its action", async () => {
    provider.client.getTokens.mockResolvedValue(tokenSet("expired", true));
    fetchMock.mockRejectedValueOnce(new Error("Network unavailable"));
    render();
    await runtime.settle();

    const failure = render() as ReactElement<Parameters<typeof ErrorDetail>[0]>;
    expect(failure.type).toBe(ErrorDetail);
    expect(failure.props.error.message).toBe("Network unavailable");
    expect(provider.client.removeTokens).not.toHaveBeenCalled();

    fetchMock.mockResolvedValueOnce(Response.json({ access_token: "recovered" }));
    const retry = ErrorDetail(failure.props).props.actions!.props.children;
    expect(retry.props.title).toBe("Retry");
    const pending = retry.props.onAction();
    expect(render()).toMatchObject({ type: "List", props: { isLoading: true } });
    await pending;
    expect(render().type).toBe(ResourceList);
    expect(useGoogleApi().accessToken).toBe("recovered");
  });

  it("recovers from expired session credentials at the command root before mounting resources", async () => {
    provider.client.getTokens.mockResolvedValue(tokenSet("expired", true));
    fetchMock.mockResolvedValueOnce(
      Response.json({ error: "invalid_grant", error_subtype: "invalid_rapt" }, { status: 400 }),
    );
    provider.authorize.mockResolvedValueOnce("reauthorized-access");
    renderCommand();
    await runtime.settle();
    expect(renderCommand().type).toBe(ResourceList);
    expect(useGoogleApi().accessToken).toBe("reauthorized-access");
    expect(provider.client.removeTokens).toHaveBeenCalledOnce();
    expect(provider.authorize).toHaveBeenCalledOnce();
  });

  it("keeps cancelled reauthorization recoverable when the list is reopened", async () => {
    provider.client.getTokens.mockResolvedValue(undefined);
    provider.authorize.mockRejectedValueOnce(new Error("Authorization cancelled"));
    renderCommand();
    await runtime.settle();
    expect(renderCommand()).toMatchObject({
      type: ErrorDetail,
      props: { error: { message: "Authorization cancelled" } },
    });

    runtime.reset();
    provider.authorize.mockResolvedValueOnce("new-login");
    renderCommand();
    await runtime.settle();
    expect(renderCommand().type).toBe(ResourceList);
    expect(useGoogleApi().accessToken).toBe("new-login");
    expect(provider.authorize).toHaveBeenCalledTimes(2);
  });

  it("never opens the native OAuth overlay in a pushed resource view", async () => {
    provider.client.getTokens.mockResolvedValue(tokenSet("expired", true));
    fetchMock.mockResolvedValueOnce(Response.json({ error: "invalid_grant" }, { status: 400 }));
    render();
    await runtime.settle();
    const failure = render() as ReactElement<Parameters<typeof ErrorDetail>[0]>;
    expect(failure.type).toBe(ErrorDetail);
    expect(failure.props.error).toBeInstanceOf(GoogleAuthenticationRequiredError);
    expect(provider.authorize).not.toHaveBeenCalled();
    expect(provider.client.removeTokens).not.toHaveBeenCalled();
  });

  it("keeps resource views unmounted until command-level sign-in finishes", async () => {
    provider.client.getTokens.mockResolvedValue(undefined);
    let completeSignIn!: (token: string) => void;
    provider.authorize.mockImplementationOnce(
      () =>
        new Promise<string>((resolve) => {
          completeSignIn = resolve;
        }),
    );
    renderCommand();
    await vi.waitFor(() => expect(provider.authorize).toHaveBeenCalledOnce());
    expect(renderCommand()).toMatchObject({ type: "List", props: { isLoading: true } });
    completeSignIn("signed-in");
    await runtime.settle();
    expect(renderCommand().type).toBe(ResourceList);
    expect(useGoogleApi().accessToken).toBe("signed-in");
  });

  it("rechecks expiration when another resource list is opened", async () => {
    render();
    await runtime.settle();
    provider.client.getTokens.mockResolvedValue(tokenSet("valid-access", true));
    fetchMock.mockResolvedValueOnce(Response.json({ access_token: "refreshed-access" }));
    runtime.reset();
    render();
    await runtime.settle();
    expect(render().type).toBe(ResourceList);
    expect(useGoogleApi().accessToken).toBe("refreshed-access");
    expect(provider.client.getTokens).toHaveBeenCalledTimes(2);
  });

  it("uses tokens recovered after an API rejection", async () => {
    render();
    await runtime.settle();
    fetchMock.mockResolvedValueOnce(Response.json({ access_token: "api-recovered-access" }));
    await refreshGoogleAccessToken("valid-access");
    expect(useGoogleApi().accessToken).toBe("api-recovered-access");
  });
});

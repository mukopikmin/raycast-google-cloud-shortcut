import type { OAuth } from "@raycast/api";
import { Children, isValidElement, type ReactElement } from "react";
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
  let state: { isLoading: boolean; data?: unknown; error?: Error };
  let pending: Promise<void> | undefined;
  let signInAttempt: number | undefined;
  let previousAttempt: number | undefined;
  return {
    reset: () => {
      state = { isLoading: true };
      pending = undefined;
      signInAttempt = undefined;
      previousAttempt = undefined;
    },
    settle: () => pending,
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
}));
vi.mock("./authorize", () => ({
  GOOGLE_SCOPE: "https://www.googleapis.com/auth/cloud-platform",
  createGoogleAuthorization: () => provider.authorize,
}));

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
const getActions = (props: Parameters<typeof ErrorDetail>[0]) =>
  Children.toArray(ErrorDetail(props).props.actions!.props.children).filter(
    (node): node is ReactElement<{ title: string; onAction: () => Promise<void> }> => isValidElement(node),
  );
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
    const retry = getActions(failure.props).find(({ props }) => props.title === "Retry")!;
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
    expect(provider.client.removeTokens).not.toHaveBeenCalled();
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

  it("offers a fresh sign-in when command-level token refresh fails", async () => {
    provider.client.getTokens.mockResolvedValue(tokenSet("expired", true));
    fetchMock.mockResolvedValueOnce(new Response("Bad request", { status: 400 }));
    renderCommand();
    await runtime.settle();
    const failure = renderCommand() as ReactElement<Parameters<typeof ErrorDetail>[0]>;
    expect(failure.type).toBe(ErrorDetail);
    const primaryAction = getActions(failure.props)[0];
    expect(primaryAction.props.title).toBe("Sign in to Google");

    provider.authorize.mockResolvedValueOnce("fresh-sign-in");
    await primaryAction.props.onAction();
    renderCommand();
    await runtime.settle();
    expect(renderCommand().type).toBe(ResourceList);
    expect(useGoogleApi().accessToken).toBe("fresh-sign-in");
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(provider.authorize).toHaveBeenCalledOnce();
  });

  it("bypasses a locally unexpired but rejected token when sign-in is explicitly requested", async () => {
    provider.client.getTokens.mockResolvedValue(tokenSet("rejected-access", false));
    provider.authorize.mockResolvedValueOnce("fresh-sign-in");
    const renderSignIn = () => WrappedCommand({ projectId: "project", forceSignIn: true });
    renderSignIn();
    await runtime.settle();
    expect(renderSignIn().type).toBe(ResourceList);
    expect(useGoogleApi().accessToken).toBe("fresh-sign-in");
    expect(provider.client.getTokens).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(provider.authorize).toHaveBeenCalledOnce();
  });

  it("allows another sign-in attempt after the fresh login is cancelled", async () => {
    provider.client.getTokens.mockRejectedValueOnce(new Error("Stored tokens unavailable"));
    renderCommand();
    await runtime.settle();
    let failure = renderCommand() as ReactElement<Parameters<typeof ErrorDetail>[0]>;
    provider.authorize.mockRejectedValueOnce(new Error("Authorization cancelled"));
    await getActions(failure.props)[0].props.onAction();
    renderCommand();
    await runtime.settle();
    failure = renderCommand() as ReactElement<Parameters<typeof ErrorDetail>[0]>;
    expect(failure.props.error.message).toBe("Authorization cancelled");
    provider.authorize.mockResolvedValueOnce("second-attempt");
    await getActions(failure.props)[0].props.onAction();
    renderCommand();
    await runtime.settle();
    expect(renderCommand().type).toBe(ResourceList);
    expect(provider.authorize).toHaveBeenCalledTimes(2);
  });

  it("honors a fresh sign-in launch even if the command component remains mounted", async () => {
    renderCommand();
    await runtime.settle();
    expect(renderCommand().type).toBe(ResourceList);
    provider.authorize.mockResolvedValueOnce("fresh-sign-in");
    const renderSignIn = () => WrappedCommand({ projectId: "project", forceSignIn: true });
    renderSignIn();
    await runtime.settle();
    expect(renderSignIn().type).toBe(ResourceList);
    expect(useGoogleApi().accessToken).toBe("fresh-sign-in");
    expect(provider.authorize).toHaveBeenCalledOnce();
  });
});

import { LaunchProps, useNavigation } from "@raycast/api";
import { useEffect, useRef } from "react";
import { withGoogleAccessToken } from "./auth/google";
import { AuthenticationRequest, GoogleCloudLaunchContext, setAuthenticationRequest } from "./auth/launch";
import { ProjectList } from "./resources/project/ProjectList";
import { ServiceList } from "./service/ServiceList";
import { useServiceResource } from "./service/useServiceResource";

const AuthenticatedCommand = withGoogleAccessToken(({ request }: { request: AuthenticationRequest }) => {
  const { push } = useNavigation();
  const restored = useRef(false);
  const { services } = useServiceResource(request.type === "resources" ? request.projectId : "");

  useEffect(() => {
    if (request.type !== "resources" || restored.current) return;
    const service = services.find((service) => service.name === request.serviceName);
    if (!service?.isSearchEnabled) return;
    restored.current = true;
    // OAuth finishes in the authentication command before restoring this stack.
    push(<ServiceList projectId={request.projectId} />);
    push(service.target);
  }, [push, request, services]);

  return <ProjectList refreshOnLoad={request.type === "refresh-projects"} />;
});

export const Command = ({ launchContext }: LaunchProps<{ launchContext: GoogleCloudLaunchContext }>) => {
  const request = launchContext?.authentication;
  setAuthenticationRequest(request);
  return request ? <AuthenticatedCommand request={request} /> : <ProjectList />;
};

export default Command;

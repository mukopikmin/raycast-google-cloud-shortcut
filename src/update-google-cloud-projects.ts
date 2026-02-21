import { useGoogleApi, withGoogleAccessToken } from "./auth/google";
import { listProjects } from "./project/api";
import { cacheProjects } from "./project/cache";

export const Command = async () => {
  const { accessToken } = useGoogleApi();
  const projects = await listProjects(accessToken);

  cacheProjects(projects);
};

export default withGoogleAccessToken(Command);

import { withGoogleAccessToken } from "./auth/google";
import { ProjectList } from "./project/ProjectList";

export const Command = () => {
  return <ProjectList />;
};

export default withGoogleAccessToken(Command);

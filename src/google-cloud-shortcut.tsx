import { withGoogleAccessToken } from "./auth/google";
import { ProjectList } from "./project/project-list";

export const Command = () => {
  return <ProjectList />;
};

export default withGoogleAccessToken(Command);

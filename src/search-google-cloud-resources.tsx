import { withGoogleAccessToken } from "./auth/google";
import { ProjectList } from "./resources/project/ProjectList";

export const Command = () => {
  return <ProjectList />;
};

export default withGoogleAccessToken(Command);

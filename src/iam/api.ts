import { fetchGoogleApi } from "../auth/api";
import { IamMemberRole, IamPolicy } from "./types";

export const fetchIamPolicies = async (projectId: string, accessToken: string): Promise<IamMemberRole[]> => {
  const data = await fetchGoogleApi<IamPolicy>(
    `https://cloudresourcemanager.googleapis.com/v1/projects/${projectId}:getIamPolicy`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify({}),
    },
  );

  const iamMemberRoles: IamMemberRole[] = [];
  const url = `https://console.cloud.google.com/iam-admin/iam?project=${projectId}`;

  data.bindings?.forEach((binding) => {
    binding.members.forEach((member) => {
      const { name, type } = parseMember(member);
      iamMemberRoles.push({
        id: `${member}-${binding.role}`,
        member,
        name,
        type,
        role: binding.role,
        url,
      });
    });
  });

  return iamMemberRoles;
};

const parseMember = (member: string) => {
  const [type, ...rest] = member.split(":");
  const name = rest.join(":");

  switch (type) {
    case "user":
      return { type: "User", name };
    case "serviceAccount":
      return { type: "Service Account", name };
    case "group":
      return { type: "Group", name };
    case "domain":
      return { type: "Domain", name };
    case "projectOwner":
      return { type: "Project Owner", name: "Project Owner" };
    case "projectEditor":
      return { type: "Project Editor", name: "Project Editor" };
    case "projectViewer":
      return { type: "Project Viewer", name: "Project Viewer" };
    case "allUsers":
      return { type: "All Users", name: "All Users" };
    case "allAuthenticatedUsers":
      return { type: "All Auth Users", name: "All Authenticated Users" };
    case "deleted":
      return { type: "Deleted", name };
    default:
      return { type: "Other", name: member };
  }
};

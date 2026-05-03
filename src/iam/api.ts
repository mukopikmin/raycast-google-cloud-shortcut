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
      iamMemberRoles.push({
        id: `${member}-${binding.role}`,
        member,
        role: binding.role,
        url,
      });
    });
  });

  return iamMemberRoles;
};

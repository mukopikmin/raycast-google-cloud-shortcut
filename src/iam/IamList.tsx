import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { useIamPolicies } from "./useIamPolicies";
import { ErrorDetail } from "../components/ErrorDetail";

type Props = {
  projectId: string;
};

export const IamList = (props: Props) => {
  const { iamMemberRoles, isLoading, error } = useIamPolicies(props.projectId);

  if (error) {
    return <ErrorDetail error={error} />;
  }

  return (
    <List isLoading={isLoading} searchBarPlaceholder="Search members or roles...">
      {iamMemberRoles?.map((item) => (
        <List.Item
          key={item.id}
          id={item.id}
          icon={Icon.Box}
          title={item.name}
          subtitle={item.role}
          accessories={[{ text: item.type }].filter((a) => a.text)}
          actions={
            <ActionPanel>
              <Action.CopyToClipboard title="Copy Member" content={item.member} />
              <Action.CopyToClipboard title="Copy Role" content={item.role} />
              <Action.OpenInBrowser title="Open in Google Cloud Console" url={item.url} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
};

import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { ErrorDetail } from "../components/ErrorDetail";
import { useCloudFunctions } from "./useCloudFunctions";

type Props = {
  projectId: string;
};

export const CloudFunctionList = ({ projectId }: Props) => {
  const { functions, isLoading, error } = useCloudFunctions(projectId);

  if (error) {
    return <ErrorDetail error={error} />;
  }

  return (
    <List isLoading={isLoading} searchBarPlaceholder="Search Cloud Functions (gen1)...">
      {functions?.map((cloudFunction) => (
        <List.Item
          key={cloudFunction.id}
          id={cloudFunction.id}
          title={cloudFunction.name}
          icon={Icon.Box}
          keywords={cloudFunction.keywords}
          accessories={[
            { text: cloudFunction.region },
            { text: cloudFunction.runtime },
            { text: cloudFunction.status },
          ].filter((a) => a.text)}
          actions={
            <ActionPanel>
              <Action.OpenInBrowser url={cloudFunction.url} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
};

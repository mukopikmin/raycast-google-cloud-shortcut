import { Icon, List } from "@raycast/api";
import { useSqls } from "./use-sqls";

type Props = {
  projectId: string;
};

export const SqlList = (props: Props) => {
  const { sqls, isLoading } = useSqls(props.projectId);

  return (
    <List isLoading={isLoading}>
      {sqls?.map((sql) => (
        <List.Item
          key={sql.id}
          id={sql.id}
          icon={Icon.ComputerChip}
          title={sql.id}
          subtitle={`${sql.region} ${sql.state}`}
        />
      ))}
    </List>
  );
};

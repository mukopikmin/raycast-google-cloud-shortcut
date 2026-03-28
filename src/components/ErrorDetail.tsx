import { Detail } from "@raycast/api";

type Props = {
  error: Error;
};

export const ErrorDetail = ({ error }: Props) => {
  const markdown = `
# Error Fetching Data

**Message:**
${error.message}

Please make sure you have authenticated and selected the right project.
  `;
  return <Detail markdown={markdown.trim()} />;
};

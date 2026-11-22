import { useCallback } from "react";
import { useGoogleApi } from "../../auth/google";
import { usePaginatedResources } from "../../hooks/usePaginatedResources";
import { PageOptions } from "../../pagination/types";
import { listApiGatewaysPage } from "./api";
import { ApiGateway } from "./types";

const getResourceId = (gateway: ApiGateway) => gateway.id;
const getName = (gateway: ApiGateway) => gateway.name;
const getSearchText = (gateway: ApiGateway) =>
  [gateway.name, gateway.displayName, gateway.region, gateway.state, gateway.defaultHostname, gateway.apiConfig]
    .filter(Boolean)
    .join(" ");

export const useApiGateways = (projectId: string, searchText = "") => {
  const { accessToken } = useGoogleApi();
  const fetchPage = useCallback(
    (options: PageOptions) => listApiGatewaysPage(projectId, accessToken, options),
    [projectId, accessToken],
  );
  const result = usePaginatedResources(fetchPage, getResourceId, getSearchText, searchText, getName);
  return { ...result, gateways: result.resources };
};

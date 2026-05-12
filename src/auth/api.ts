import { refreshGoogleAccessToken } from "./google";

const requestGoogleApi = (url: string, accessToken: string) =>
  fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

const getErrorDetail = async (response: Response) => {
  try {
    const body = await response.json();
    return JSON.stringify(body);
  } catch {
    return response.statusText;
  }
};

export const fetchGoogleApi = async <T>(url: string, accessToken: string): Promise<T> => {
  const response = await requestGoogleApi(url, accessToken);

  if (response.status === 401) {
    const refreshedAccessToken = await refreshGoogleAccessToken();

    if (refreshedAccessToken) {
      const retriedResponse = await requestGoogleApi(url, refreshedAccessToken);

      if (retriedResponse.ok) {
        return (await retriedResponse.json()) as T;
      }
    }
  }

  if (!response.ok) {
    const errorDetail = await getErrorDetail(response);

    if (response.status === 401) {
      throw new Error(`Unauthorized (401): Access token is invalid or expired. URL: ${url} Response: ${errorDetail}`);
    }

    if (response.status === 403) {
      throw new Error(
        `Forbidden (403): You don't have permission to access this resource. URL: ${url} Response: ${errorDetail}`,
      );
    }

    throw new Error(`Failed to fetch (${response.status}): ${errorDetail}. URL: ${url}`);
  }

  return (await response.json()) as T;
};

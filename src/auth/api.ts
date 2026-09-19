import { getGoogleAccessToken, refreshGoogleAccessToken } from "./google";

const requestGoogleApi = (url: string, accessToken: string, init?: RequestInit) =>
  fetch(url, {
    ...init,
    headers: { Authorization: `Bearer ${accessToken}`, ...init?.headers },
  });

const getErrorDetail = async (response: Response) => {
  try {
    const body = await response.json();
    return JSON.stringify(body);
  } catch {
    return response.statusText;
  }
};

export const fetchGoogleApi = async <T>(url: string, accessToken: string, init?: RequestInit): Promise<T> => {
  const currentAccessToken = await getGoogleAccessToken(accessToken);
  let response = await requestGoogleApi(url, currentAccessToken, init);

  if (response.status === 401) {
    const refreshedAccessToken = await refreshGoogleAccessToken(currentAccessToken);

    if (refreshedAccessToken) {
      response = await requestGoogleApi(url, refreshedAccessToken, init);
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

export const fetchGoogleApi = async <T>(url: string, accessToken: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(url, {
    ...init,
    headers: { Authorization: `Bearer ${accessToken}`, ...init?.headers },
  });

  if (!response.ok) {
    let errorDetail = "";
    try {
      const body = await response.json();
      errorDetail = JSON.stringify(body);
    } catch {
      errorDetail = response.statusText;
    }

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

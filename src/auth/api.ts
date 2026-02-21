export const fetchGoogleApi = async <T>(url: string, accessToken: string): Promise<T> => {
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (response.status === 401) {
    throw new Error("Unauthorized: Access token is invalid or expired.");
  }

  if (response.status === 403) {
    throw new Error("Forbidden: You don't have permission to access this resource.");
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.statusText}`);
  }

  return (await response.json()) as T;
};

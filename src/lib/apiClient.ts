const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const API_BASE_VERSION = '/api/v1';

// Generic fetch wrapper
export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${API_BASE_VERSION}${endpoint}`;

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      // TODO: Add auth token if available
      ...(localStorage.getItem('authToken') && {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  return response.json() as Promise<T>;
}
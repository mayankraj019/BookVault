import { useAuthStore } from '../store/useAuthStore';

const BASE_URL = 'http://localhost:5001/api';

async function refreshAccessToken(): Promise<string | null> {
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // CRITICAL: sends the HttpOnly refreshToken cookie
    });

    if (!res.ok) return null;
    const payload = await res.json();

    if (payload.success && payload.data?.accessToken) {
      return payload.data.accessToken as string;
    }
    return null;
  } catch {
    return null;
  }
}

export async function apiRequest<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const { accessToken, setAuth, clearAuth } = useAuthStore.getState();

  const headers = new Headers(options.headers);
  if (accessToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const url = `${BASE_URL}${endpoint}`;
  let response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    // Attempt silent token refresh using the HttpOnly refresh cookie
    const newAccessToken = await refreshAccessToken();
    if (newAccessToken) {
      const user = useAuthStore.getState().user;
      if (user) setAuth(user, newAccessToken);
      headers.set('Authorization', `Bearer ${newAccessToken}`);
      response = await fetch(url, { ...options, headers, credentials: 'include' });
    } else {
      clearAuth();
      throw new Error('Session expired. Please log in again.');
    }
  }

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || 'API Request failed');
  }

  return payload.data as T;
}

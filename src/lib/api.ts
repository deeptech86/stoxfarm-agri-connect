/**
 * API Client for StoxxFarm Backend
 */

const getDefaultApiBaseUrl = () => {
  // Use local backend only during development; in production prefer same-origin API path.
  if (import.meta.env.DEV) {
    return 'http://127.0.0.1:8000/api/v1';
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}/api/v1`;
  }

  return '/api/v1';
};

const getApiBaseUrl = () => {
  const envApiUrl = import.meta.env.VITE_API_URL?.trim();

  if (envApiUrl) {
    // Guard against accidentally shipping localhost API URLs to production.
    if (!import.meta.env.DEV && /(^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?)/i.test(envApiUrl)) {
      return getDefaultApiBaseUrl();
    }
    return envApiUrl;
  }

  return getDefaultApiBaseUrl();
};

const API_BASE_URL = getApiBaseUrl();

interface TokenData {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

// Token storage
const TOKEN_KEY = 'stoxxfarm_tokens';

export const getStoredTokens = (): TokenData | null => {
  const stored = localStorage.getItem(TOKEN_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
  return null;
};

export const setStoredTokens = (tokens: TokenData) => {
  localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
};

export const clearStoredTokens = () => {
  localStorage.removeItem(TOKEN_KEY);
};

// API Error class
export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Refresh token logic
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach(cb => cb(token));
  refreshSubscribers = [];
};

const refreshAccessToken = async (): Promise<string | null> => {
  const tokens = getStoredTokens();
  if (!tokens?.refresh_token) return null;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: tokens.refresh_token }),
    });

    if (!response.ok) {
      clearStoredTokens();
      return null;
    }

    const data = await response.json();
    setStoredTokens(data);
    return data.access_token;
  } catch {
    clearStoredTokens();
    return null;
  }
};

// Base fetch wrapper with auth
export const apiFetch = async <T>(
  endpoint: string,
  options: RequestInit = {},
  retry = true
): Promise<T> => {
  const tokens = getStoredTokens();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (tokens?.access_token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${tokens.access_token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle 401 - try to refresh token
  if (response.status === 401 && retry && tokens?.refresh_token) {
    if (!isRefreshing) {
      isRefreshing = true;
      const newToken = await refreshAccessToken();
      isRefreshing = false;

      if (newToken) {
        onTokenRefreshed(newToken);
        return apiFetch<T>(endpoint, options, false);
      } else {
        // Don't force redirect - let the calling code handle session expiration gracefully
        throw new ApiError(401, 'Session expired');
      }
    } else {
      // Wait for token refresh
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh(async () => {
          try {
            const result = await apiFetch<T>(endpoint, options, false);
            resolve(result);
          } catch (err) {
            reject(err);
          }
        });
      });
    }
  }

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: response.statusText };
    }
    throw new ApiError(
      response.status,
      errorData.message || errorData.detail || 'An error occurred',
      errorData
    );
  }

  // Handle empty responses
  const text = await response.text();
  if (!text) {
    return {} as T;
  }

  return JSON.parse(text);
};

// Convenience methods
export const api = {
  get: <T>(endpoint: string, options?: RequestInit) =>
    apiFetch<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, data?: unknown, options?: RequestInit) =>
    apiFetch<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T>(endpoint: string, data?: unknown, options?: RequestInit) =>
    apiFetch<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),

  patch: <T>(endpoint: string, data?: unknown, options?: RequestInit) =>
    apiFetch<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T>(endpoint: string, options?: RequestInit) =>
    apiFetch<T>(endpoint, { ...options, method: 'DELETE' }),
};

export default api;

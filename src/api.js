const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const TOKEN_KEY = 'choir_auth_token';
const REFRESH_TOKEN_KEY = 'choir_refresh_token';

/** GitHub Pages → Render uses Bearer tokens; local dev uses httpOnly cookies via the Vite proxy. */
export const usesBearerAuth = Boolean(API_BASE);

export function getApiBase() {
  return API_BASE;
}

let onUnauthorized = null;
let refreshPromise = null;

export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

function isPublicAuthRoute() {
  const path = window.location.hash.replace(/^#/, '') || '/';
  return (
    path === '/login' ||
    path.startsWith('/login?') ||
    path === '/register' ||
    path.startsWith('/register?')
  );
}

function redirectToLogin() {
  if (!isPublicAuthRoute()) {
    window.location.hash = '#/login?session=expired';
  }
}

function handleUnauthorized() {
  clearAuthTokens();
  onUnauthorized?.();
  redirectToLogin();
}

export function getAuthToken() {
  if (!usesBearerAuth) return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken() {
  if (!usesBearerAuth) return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setAuthToken(token) {
  if (!usesBearerAuth) return;
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function setRefreshToken(token) {
  if (!usesBearerAuth) return;
  if (token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}

export function clearAuthTokens() {
  setAuthToken(null);
  setRefreshToken(null);
}

function storeAuthPayload(data) {
  if (!usesBearerAuth) return;
  if (data.token) {
    setAuthToken(data.token);
  }
  if (data.refreshToken) {
    setRefreshToken(data.refreshToken);
  }
}

async function request(path, { method = 'GET', body, headers = {}, skipAuth = false } = {}) {
  const requestHeaders = { ...headers };
  if (body) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  if (usesBearerAuth) {
    requestHeaders['X-Auth-Client'] = 'bearer';
    if (!skipAuth) {
      const token = getAuthToken();
      if (token) {
        requestHeaders.Authorization = `Bearer ${token}`;
      }
    }
  }

  return fetch(`${API_BASE}${path}`, {
    method,
    credentials: 'include',
    headers: Object.keys(requestHeaders).length ? requestHeaders : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
}

export async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshToken = getRefreshToken();
      const response = await request('/api/auth/refresh', {
        method: 'POST',
        body: refreshToken ? { refreshToken } : undefined,
        skipAuth: true,
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || 'Session expired. Please sign in again.');
      }

      storeAuthPayload(data);
      return data;
    })().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

export async function api(
  path,
  { method = 'GET', body, skipAuthRedirect = false, retryOnUnauthorized = true } = {}
) {
  let response = await request(path, { method, body });
  let data = await response.json().catch(() => ({}));

  if (
    response.status === 401 &&
    retryOnUnauthorized &&
    !skipAuthRedirect &&
    path !== '/api/auth/refresh' &&
    path !== '/api/auth/login' &&
    path !== '/api/auth/register'
  ) {
    try {
      await refreshAccessToken();
      response = await request(path, { method, body });
      data = await response.json().catch(() => ({}));
    } catch {
      handleUnauthorized();
      throw new Error(data.error || 'Session expired. Please sign in again.');
    }
  }

  if (!response.ok) {
    if (response.status === 401 && !skipAuthRedirect) {
      handleUnauthorized();
    }
    throw new Error(data.error || 'Request failed');
  }

  storeAuthPayload(data);
  return data;
}

export function formatDate(value) {
  return new Date(value).toLocaleString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function toDateInput(value) {
  const date = value instanceof Date ? value : new Date(value);
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function toDateTimeLocal(value) {
  const date = value ? new Date(value) : new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export const VOICE_PARTS = [
  { value: 'soprano', label: 'Soprano' },
  { value: 'alto', label: 'Alto' },
  { value: 'tenor', label: 'Tenor' },
  { value: 'bass', label: 'Bass' },
  { value: 'other', label: 'Other' },
];

export const EVENT_TYPES = [
  { value: 'practice', label: 'Practice' },
  { value: 'service', label: 'Service' },
  { value: 'concert', label: 'Concert' },
  { value: 'other', label: 'Other' },
];

export function formatEventType(type) {
  if (type === 'rehearsal') return 'Practice';
  if (!type) return '—';
  return type.charAt(0).toUpperCase() + type.slice(1);
}

export const LITURGICAL_COLORS = [
  { value: '', label: 'Not set' },
  { value: 'white', label: 'White' },
  { value: 'green', label: 'Green' },
  { value: 'purple', label: 'Purple' },
  { value: 'red', label: 'Red' },
  { value: 'black', label: 'Black' },
];

export const MEMBER_ATTENDANCE_STATUSES = [
  { value: 'present', label: 'Present' },
  { value: 'late', label: 'Late' },
  { value: 'absent', label: 'Absent' },
  { value: 'excused', label: 'Excused' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'unmarked', label: 'Not marked' },
];

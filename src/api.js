const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const TOKEN_KEY = 'choir_auth_token';

let onUnauthorized = null;

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
  setAuthToken(null);
  onUnauthorized?.();
  redirectToLogin();
}

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export async function api(path, { method = 'GET', body, skipAuthRedirect = false } = {}) {
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';

  const token = getAuthToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    credentials: 'include',
    headers: Object.keys(headers).length ? headers : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && !skipAuthRedirect) {
      handleUnauthorized();
    }
    throw new Error(data.error || 'Request failed');
  }

  if (data.token) {
    setAuthToken(data.token);
  }

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

const PARISH_EMAIL_DOMAIN = 'stpauls.parish';

export function validateEmail(email) {
  const raw = String(email || '');
  if (/\s/.test(raw)) {
    return 'Email address cannot contain spaces';
  }
  const value = raw.trim();
  if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return 'Please enter a valid email address';
  }
  return '';
}

export function isPlaceholderParishEmail(email) {
  const normalized = String(email || '').trim().toLowerCase();
  if (!normalized) return true;
  return normalized.endsWith(`@${PARISH_EMAIL_DOMAIN}`);
}

export function emailNeedsUpdate(user) {
  if (!user) return false;
  if (user.emailNeedsUpdate) return true;
  return isPlaceholderParishEmail(user.email);
}

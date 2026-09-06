export const MIN_PASSWORD_LENGTH = 8;

export function validatePassword(password, { required = false } = {}) {
  const value = password ?? '';

  if (!value) {
    return required ? `Password must be at least ${MIN_PASSWORD_LENGTH} characters` : null;
  }

  if (value.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
  }

  return null;
}

/** Strip whitespace so usernames and passwords cannot contain spaces. */
export function usernameInputValue(raw) {
  return String(raw).toLowerCase().replace(/\s/g, '');
}

export function passwordInputValue(raw) {
  return String(raw).replace(/\s/g, '');
}

export function emailInputValue(raw) {
  return String(raw).replace(/\s/g, '');
}

import { emailNeedsUpdate } from './email.js';
import { MIN_PASSWORD_LENGTH } from './password.js';
import { voicePartNeedsUpdate } from './voice-part.js';

export function getFirstSignInCopy(user) {
  const showEmail = emailNeedsUpdate(user);
  const showVoicePart = voicePartNeedsUpdate(user);
  const extendedSetup = showEmail || showVoicePart;

  const steps = [];
  if (showEmail) steps.push('add your email');
  if (showVoicePart) steps.push('choose your voice part');
  steps.push(`set a personal password (at least ${MIN_PASSWORD_LENGTH} characters)`);

  let detail;
  if (steps.length === 1) {
    detail = steps[0];
  } else {
    detail = `${steps.slice(0, -1).join(', ')}, and ${steps[steps.length - 1]}`;
  }
  detail = `${detail.charAt(0).toUpperCase()}${detail.slice(1)}`;

  return {
    pageTitle: extendedSetup ? 'Set up your account' : 'Set your password',
    intro: `This is your first sign-in. ${detail} before continuing.`,
    currentPasswordLabel: 'Temporary password',
    currentPasswordHint: 'The password you just used to sign in.',
    newPasswordLabel: 'New password',
    confirmPasswordLabel: 'Confirm password',
    submitLabel: 'Continue',
  };
}

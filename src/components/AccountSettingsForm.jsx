import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { StatusMessage } from './StatusMessage.jsx';
import { emailNeedsUpdate, isPlaceholderParishEmail, validateEmail } from '../utils/email.js';
import { emailInputValue, passwordInputValue } from '../utils/credential-input.js';
import { MIN_PASSWORD_LENGTH, validatePassword } from '../utils/password.js';

export function AccountSettingsForm({ user, onSuccess }) {
  const needsEmailUpdate = emailNeedsUpdate(user);
  const [email, setEmail] = useState(user?.email || '');
  const [emailError, setEmailError] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setEmail(user?.email || '');
  }, [user?.email]);

  function validateEmailField() {
    const nextEmailError = validateEmail(email);
    if (nextEmailError) {
      setEmailError(nextEmailError);
      return false;
    }
    setEmailError('');
    if (isPlaceholderParishEmail(email)) {
      setEmailError('Please enter your personal email address');
      return false;
    }
    return true;
  }

  async function onSubmit(event) {
    event.preventDefault();
    setError('');
    setSaved('');

    const emailTrimmed = email.trim();
    const emailChanged = emailTrimmed.toLowerCase() !== (user?.email || '').toLowerCase();
    const changingPassword = Boolean(currentPassword || newPassword || confirmPassword);

    if (!emailChanged && !changingPassword) {
      setSaved('No changes to save');
      return;
    }

    if (emailChanged || (changingPassword && needsEmailUpdate)) {
      if (!validateEmailField()) {
        return;
      }
    }

    if (changingPassword) {
      if (!currentPassword) {
        setError('Enter your current password to set a new one');
        return;
      }
      const nextPasswordError = validatePassword(newPassword, { required: true });
      if (nextPasswordError) {
        setNewPasswordError(nextPasswordError);
        return;
      }
      setNewPasswordError('');
      if (newPassword !== confirmPassword) {
        setError('New passwords do not match');
        return;
      }
      if (needsEmailUpdate && isPlaceholderParishEmail(emailTrimmed)) {
        setEmailError('Please enter your personal email address');
        return;
      }
    }

    setBusy(true);
    try {
      let updatedUser = user;

      if (changingPassword) {
        const body = { currentPassword, newPassword };
        if (emailChanged) {
          body.email = emailTrimmed;
        }
        const data = await api('/api/auth/change-password', {
          method: 'POST',
          body,
          skipAuthRedirect: true,
        });
        updatedUser = data.user ?? updatedUser;
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setSaved(emailChanged ? 'Email and password updated' : 'Password updated');
      } else if (emailChanged) {
        const data = await api('/api/auth/account', {
          method: 'PATCH',
          body: { email: emailTrimmed },
          skipAuthRedirect: true,
        });
        updatedUser = data.user ?? updatedUser;
        setSaved('Email updated');
      }

      if (updatedUser && updatedUser !== user) {
        onSuccess?.(updatedUser);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="card form account-settings-form" onSubmit={onSubmit}>
      <h2>Account settings</h2>
      <p className="muted">
        {needsEmailUpdate
          ? 'Add your personal email so the choir team can reach you. You can also change your password below.'
          : `Update your email or password. New passwords need at least ${MIN_PASSWORD_LENGTH} characters; you stay signed in after saving.`}
      </p>
      {error ? <p className="alert">{error}</p> : null}
      <StatusMessage message={saved} onDismiss={() => setSaved('')} />

      <label>
        Email
        <input
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(emailInputValue(e.target.value));
            if (emailError) setEmailError('');
          }}
          required
          aria-invalid={emailError ? 'true' : undefined}
          aria-describedby={emailError ? 'account-email-error' : undefined}
        />
        {emailError ? (
          <span className="field-error" id="account-email-error" role="alert">
            {emailError}
          </span>
        ) : needsEmailUpdate ? (
          <span className="field-hint">Placeholder parish addresses cannot be kept.</span>
        ) : null}
      </label>

      <div className="form-subsection">
        <h3 className="form-subsection-title">Change password</h3>
        <p className="muted form-subsection-lede">Leave blank if you only want to update your email.</p>
        <label>
          Current password
          <input
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(passwordInputValue(e.target.value))}
          />
        </label>
        <label>
          New password
          <input
            type="password"
            autoComplete="new-password"
            minLength={MIN_PASSWORD_LENGTH}
            value={newPassword}
            onChange={(e) => {
              setNewPassword(passwordInputValue(e.target.value));
              if (newPasswordError) setNewPasswordError('');
            }}
            aria-invalid={newPasswordError ? 'true' : undefined}
            aria-describedby={newPasswordError ? 'account-new-password-error' : 'account-new-password-hint'}
          />
          {newPasswordError ? (
            <span className="field-error" id="account-new-password-error" role="alert">
              {newPasswordError}
            </span>
          ) : (
            <span className="field-hint" id="account-new-password-hint">
              At least {MIN_PASSWORD_LENGTH} characters.
            </span>
          )}
        </label>
        <label>
          Confirm new password
          <input
            type="password"
            autoComplete="new-password"
            minLength={MIN_PASSWORD_LENGTH}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(passwordInputValue(e.target.value))}
          />
        </label>
      </div>

      <button type="submit" disabled={busy}>
        {busy ? 'Saving…' : 'Save changes'}
      </button>
    </form>
  );
}

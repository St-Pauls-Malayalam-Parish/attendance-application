import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { StatusMessage } from './StatusMessage.jsx';
import { emailNeedsUpdate, isPlaceholderParishEmail, validateEmail } from '../utils/email.js';
import { emailInputValue, passwordInputValue } from '../utils/credential-input.js';
import { MIN_PASSWORD_LENGTH, validatePassword } from '../utils/password.js';
import { voicePartNeedsUpdate } from '../utils/voice-part.js';
import { VOICE_PARTS } from '../api.js';
import { getFirstSignInCopy } from '../utils/onboarding-copy.js';

export function ChangePasswordForm({ required = false, user, onSuccess }) {
  const navigate = useNavigate();
  const showEmail = required && emailNeedsUpdate(user);
  const showVoicePart = required && voicePartNeedsUpdate(user);
  const firstSignInCopy = required && user ? getFirstSignInCopy(user) : null;
  const [voicePart, setVoicePart] = useState('');
  const [email, setEmail] = useState(user?.email && !isPlaceholderParishEmail(user.email) ? user.email : '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [saved, setSaved] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    setError('');
    setSaved('');

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

    if (showEmail) {
      const nextEmailError = validateEmail(email);
      if (nextEmailError) {
        setError(nextEmailError);
        return;
      }
      if (isPlaceholderParishEmail(email)) {
        setError('Please enter your personal email address');
        return;
      }
    }

    if (showVoicePart && !voicePart) {
      setError('Please select your voice part');
      return;
    }

    setBusy(true);
    try {
      const body = { currentPassword, newPassword };
      if (showEmail || (email.trim() && email.trim().toLowerCase() !== (user?.email || '').toLowerCase())) {
        body.email = email.trim();
      }
      if (showVoicePart) {
        body.voicePart = voicePart;
      }
      const data = await api('/api/auth/change-password', {
        method: 'POST',
        body,
        skipAuthRedirect: true,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      if (required && data.user) {
        onSuccess?.(data.user);
        navigate(data.user.role === 'admin' ? '/admin/events' : '/attendance', { replace: true });
        return;
      }
      setSaved('Password updated');
      if (data.user) {
        onSuccess?.(data.user);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      className={`card form${required ? ' auth-form' : ''}`}
      onSubmit={onSubmit}
    >
      {required ? (
        <p className="auth-form-intro">{firstSignInCopy.intro}</p>
      ) : (
        <>
          <h2>Change password</h2>
          <p className="muted">
            Use at least {MIN_PASSWORD_LENGTH} characters. You will stay signed in after saving.
          </p>
        </>
      )}
      {error ? <p className="alert">{error}</p> : null}
      <StatusMessage message={saved} onDismiss={() => setSaved('')} />
      {showEmail ? (
        <label>
          Email address
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(emailInputValue(e.target.value))}
            required
          />
        </label>
      ) : null}
      {showVoicePart ? (
        <label>
          Voice part
          <select value={voicePart} onChange={(e) => setVoicePart(e.target.value)} required>
            <option value="">Select voice part</option>
            {VOICE_PARTS.map((part) => (
              <option key={part.value} value={part.value}>
                {part.label}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <label>
        {required ? firstSignInCopy.currentPasswordLabel : 'Current password'}
        <input
          type="password"
          autoComplete="current-password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(passwordInputValue(e.target.value))}
          required
          aria-describedby={required ? 'onboarding-temp-password-hint' : undefined}
        />
        {required ? (
          <span className="field-hint" id="onboarding-temp-password-hint">
            {firstSignInCopy.currentPasswordHint}
          </span>
        ) : null}
      </label>
      <label>
        {required ? firstSignInCopy.newPasswordLabel : 'New password'}
        <input
          type="password"
          autoComplete="new-password"
          minLength={MIN_PASSWORD_LENGTH}
          value={newPassword}
          onChange={(e) => {
            setNewPassword(passwordInputValue(e.target.value));
            if (newPasswordError) {
              setNewPasswordError('');
            }
          }}
          required
          aria-invalid={newPasswordError ? 'true' : undefined}
          aria-describedby={newPasswordError ? 'new-password-error' : 'new-password-hint'}
        />
        {newPasswordError ? (
          <span className="field-error" id="new-password-error" role="alert">
            {newPasswordError}
          </span>
        ) : (
          <span className="field-hint" id="new-password-hint">
            At least {MIN_PASSWORD_LENGTH} characters.
          </span>
        )}
      </label>
      <label>
        {required ? firstSignInCopy.confirmPasswordLabel : 'Confirm new password'}
        <input
          type="password"
          autoComplete="new-password"
          minLength={MIN_PASSWORD_LENGTH}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(passwordInputValue(e.target.value))}
          required
        />
      </label>
      <button type="submit" className={required ? 'auth-submit' : undefined} disabled={busy}>
        {busy ? 'Saving…' : required ? firstSignInCopy.submitLabel : 'Update password'}
      </button>
    </form>
  );
}

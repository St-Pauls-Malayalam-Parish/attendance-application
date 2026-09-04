import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';

export function ChangePasswordForm({ required = false, onSuccess }) {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    setError('');
    setSaved('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setBusy(true);
    try {
      const data = await api('/api/auth/change-password', {
        method: 'POST',
        body: { currentPassword, newPassword },
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
    <form className="card form" onSubmit={onSubmit}>
      <h2>{required ? 'Set your password' : 'Change password'}</h2>
      <p className="muted">
        {required
          ? 'This is your first sign-in. Choose a personal password (at least 8 characters) before continuing.'
          : 'Use at least 8 characters. You will stay signed in after saving.'}
      </p>
      {error ? <p className="alert">{error}</p> : null}
      {saved ? <p className="ok">{saved}</p> : null}
      <label>
        Current password
        <input
          type="password"
          autoComplete="current-password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />
      </label>
      <label>
        New password
        <input
          type="password"
          autoComplete="new-password"
          minLength={8}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
      </label>
      <label>
        Confirm new password
        <input
          type="password"
          autoComplete="new-password"
          minLength={8}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </label>
      <button type="submit" disabled={busy}>
        {busy ? 'Saving…' : required ? 'Continue' : 'Update password'}
      </button>
    </form>
  );
}

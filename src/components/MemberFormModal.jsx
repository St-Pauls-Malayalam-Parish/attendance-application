import { useEffect, useState } from 'react';
import { VOICE_PARTS } from '../api.js';
import { MIN_PASSWORD_LENGTH, validatePassword } from '../utils/password.js';

export function MemberFormModal({
  open,
  editingId,
  form,
  onFormChange,
  busy,
  onSubmit,
  onClose,
  error = '',
}) {
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (!open) {
      setPasswordError('');
    }
  }, [open]);
  useEffect(() => {
    if (!open) return undefined;

    function onKeyDown(event) {
      if (event.key === 'Escape' && !busy) {
        onClose();
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, busy, onClose]);

  if (!open) {
    return null;
  }

  function handleSubmit(event) {
    event.preventDefault();
    const nextPasswordError = validatePassword(form.password, { required: !editingId });
    if (nextPasswordError) {
      setPasswordError(nextPasswordError);
      return;
    }
    setPasswordError('');
    onSubmit();
  }

  function updateField(key, value) {
    onFormChange({ ...form, [key]: value });
    if (key === 'password' && passwordError) {
      setPasswordError('');
    }
  }

  return (
    <div
      className="event-form-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="member-form-title"
    >
      <button
        type="button"
        className="event-form-backdrop"
        aria-label="Close member form"
        onClick={onClose}
        disabled={busy}
      />
      <div className="event-form-panel member-form-panel card">
        <div className="event-form-head">
          <h2 id="member-form-title">{editingId ? 'Edit member' : 'Add approved member'}</h2>
          <button type="button" className="ghost event-form-close" onClick={onClose} disabled={busy}>
            Close
          </button>
        </div>

        {error ? <p className="alert">{error}</p> : null}

        <form className="form grid-form event-form member-form" onSubmit={handleSubmit}>
          <label>
            Name
            <input
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              required
              autoFocus
            />
          </label>
          <label>
            Username
            <input
              value={form.username}
              onChange={(e) => updateField('username', e.target.value.toLowerCase())}
              required
            />
          </label>
          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(e) => updateField('email', e.target.value)}
              required
            />
          </label>
          <label>
            {editingId ? 'Reset password (optional)' : 'Temporary password'}
            <input
              type="password"
              minLength={MIN_PASSWORD_LENGTH}
              value={form.password}
              onChange={(e) => updateField('password', e.target.value)}
              required={!editingId}
              placeholder={editingId ? 'Leave blank to keep current password' : ''}
              autoComplete={editingId ? 'new-password' : 'off'}
              aria-invalid={passwordError ? 'true' : undefined}
              aria-describedby={passwordError ? 'member-password-error' : 'member-password-hint'}
            />
            {passwordError ? (
              <span className="field-error" id="member-password-error" role="alert">
                {passwordError}
              </span>
            ) : (
              <span className="field-hint" id="member-password-hint">
                {editingId
                  ? `If you set a new password, use at least ${MIN_PASSWORD_LENGTH} characters.`
                  : `At least ${MIN_PASSWORD_LENGTH} characters. The member must change it on first sign-in.`}
              </span>
            )}
          </label>
          <label>
            Voice part
            <select
              value={form.voicePart}
              onChange={(e) => updateField('voicePart', e.target.value)}
              required
            >
              <option value="">Select voice part</option>
              {VOICE_PARTS.map((part) => (
                <option key={part.value} value={part.value}>
                  {part.label}
                </option>
              ))}
            </select>
          </label>

          <div className="event-form-actions span-2">
            <div className="row-actions event-form-submit-row">
              <button type="button" className="ghost" onClick={onClose} disabled={busy}>
                Cancel
              </button>
              <button type="submit" disabled={busy}>
                {busy ? 'Saving…' : editingId ? 'Save changes' : 'Add approved member'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

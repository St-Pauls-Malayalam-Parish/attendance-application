import { useEffect } from 'react';
import { VOICE_PARTS } from '../api.js';

export function MemberFormModal({
  open,
  editingId,
  form,
  onFormChange,
  busy,
  onSubmit,
  onClose,
}) {
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
    onSubmit();
  }

  function updateField(key, value) {
    onFormChange({ ...form, [key]: value });
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
              minLength={editingId ? undefined : 8}
              value={form.password}
              onChange={(e) => updateField('password', e.target.value)}
              required={!editingId}
              placeholder={editingId ? 'Leave blank to keep current password' : ''}
              autoComplete={editingId ? 'new-password' : 'off'}
            />
          </label>
          <label>
            Voice part
            <select value={form.voicePart} onChange={(e) => updateField('voicePart', e.target.value)}>
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

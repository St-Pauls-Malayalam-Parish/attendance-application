import { useEffect, useState } from 'react';
import { MemberProfileForm } from './MemberProfileForm.jsx';

export function MemberProfileModal({ open, member, onClose, onSaved }) {
  const [busy, setBusy] = useState(false);

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

  if (!open || !member) {
    return null;
  }

  return (
    <div
      className="event-form-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="member-profile-form-title"
    >
      <button
        type="button"
        className="event-form-backdrop"
        aria-label="Close feedback form"
        onClick={onClose}
        disabled={busy}
      />
      <div className="event-form-panel member-form-panel member-profile-modal-panel card">
        <div className="event-form-head">
          <h2 id="member-profile-form-title">Member feedback</h2>
          <button type="button" className="ghost event-form-close" onClick={onClose} disabled={busy}>
            Close
          </button>
        </div>

        <MemberProfileForm
          memberId={member.id}
          onClose={onClose}
          onSaved={onSaved}
          busy={busy}
          setBusy={setBusy}
        />
      </div>
    </div>
  );
}

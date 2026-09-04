import { useEffect } from 'react';
import { EVENT_TYPES, LITURGICAL_COLORS } from '../api.js';

export function EventFormModal({
  open,
  editingId,
  form,
  onFormChange,
  busy,
  onSubmit,
  onClose,
  onDelete,
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
    <div className="event-form-dialog" role="dialog" aria-modal="true" aria-labelledby="event-form-title">
      <button
        type="button"
        className="event-form-backdrop"
        aria-label="Close event form"
        onClick={onClose}
        disabled={busy}
      />
      <div className="event-form-panel card">
        <div className="event-form-head">
          <h2 id="event-form-title">{editingId ? 'Edit event' : 'Add event'}</h2>
          <button type="button" className="ghost event-form-close" onClick={onClose} disabled={busy}>
            Close
          </button>
        </div>

        <form className="form grid-form event-form" onSubmit={handleSubmit}>
          <label>
            Title
            <input
              value={form.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="Friday practice"
              required
              autoFocus
            />
          </label>
          <label>
            Date and time
            <input
              type="datetime-local"
              value={form.date}
              onChange={(e) => updateField('date', e.target.value)}
              required
            />
          </label>
          <label>
            Type
            <select value={form.type} onChange={(e) => updateField('type', e.target.value)}>
              {EVENT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Liturgical colour
            <select
              value={form.liturgicalColor}
              onChange={(e) => updateField('liturgicalColor', e.target.value)}
            >
              {LITURGICAL_COLORS.map((color) => (
                <option key={color.value || 'none'} value={color.value}>
                  {color.label}
                </option>
              ))}
            </select>
          </label>
          <label className="span-2">
            Notes
            <input value={form.notes} onChange={(e) => updateField('notes', e.target.value)} />
          </label>

          <div className="event-form-actions span-2">
            {editingId && onDelete ? (
              <button type="button" className="ghost danger" onClick={onDelete} disabled={busy}>
                Delete event
              </button>
            ) : null}
            <div className="row-actions event-form-submit-row">
              <button type="button" className="ghost" onClick={onClose} disabled={busy}>
                Cancel
              </button>
              <button type="submit" disabled={busy}>
                {busy ? 'Saving…' : editingId ? 'Save changes' : 'Add event'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

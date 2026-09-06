import { useEffect } from 'react';
import { FAQ_AUDIENCES } from '../api.js';

export function FaqFormModal({
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
    <div className="event-form-dialog" role="dialog" aria-modal="true" aria-labelledby="faq-form-title">
      <button
        type="button"
        className="event-form-backdrop"
        aria-label="Close FAQ form"
        onClick={onClose}
        disabled={busy}
      />
      <div className="event-form-panel card faq-form-panel">
        <div className="event-form-head">
          <h2 id="faq-form-title">{editingId ? 'Edit FAQ' : 'Add FAQ'}</h2>
          <button type="button" className="ghost event-form-close" onClick={onClose} disabled={busy}>
            Close
          </button>
        </div>

        <form className="form grid-form event-form faq-form" onSubmit={handleSubmit}>
          <label className="span-2">
            Question
            <input
              value={form.question}
              onChange={(e) => updateField('question', e.target.value)}
              placeholder="How do I view my attendance?"
              required
              maxLength={300}
              autoFocus
            />
          </label>
          <label>
            Audience
            <select value={form.audience} onChange={(e) => updateField('audience', e.target.value)}>
              {FAQ_AUDIENCES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <span className="field-hint">{formatFaqAudienceHint(form.audience)}</span>
          </label>
          <label>
            Sort order
            <input
              type="number"
              min="0"
              step="1"
              value={form.sortOrder}
              onChange={(e) => updateField('sortOrder', e.target.value)}
            />
            <span className="field-hint">Lower numbers appear first.</span>
          </label>
          <label className="span-2">
            Answer
            <textarea
              value={form.answer}
              onChange={(e) => updateField('answer', e.target.value)}
              rows={6}
              required
              maxLength={5000}
            />
          </label>
          <div className="span-2 faq-published-field">
            <input
              id="faq-published"
              type="checkbox"
              checked={form.published}
              onChange={(e) => updateField('published', e.target.checked)}
            />
            <label htmlFor="faq-published">Published — visible to the selected audience</label>
          </div>

          <div className="event-form-actions span-2">
            {editingId && onDelete ? (
              <button type="button" className="ghost danger" onClick={onDelete} disabled={busy}>
                Delete FAQ
              </button>
            ) : null}
            <div className="row-actions event-form-submit-row">
              <button type="button" className="ghost" onClick={onClose} disabled={busy}>
                Cancel
              </button>
              <button type="submit" disabled={busy}>
                {busy ? 'Saving…' : editingId ? 'Save changes' : 'Add FAQ'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function formatFaqAudienceHint(audience) {
  if (audience === 'member') return 'Shown on the member Help page.';
  if (audience === 'admin') return 'Shown only to choir admins.';
  return 'Shown to both members and admins.';
}

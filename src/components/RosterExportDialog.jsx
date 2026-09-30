import { useEffect, useState } from 'react';
import { fieldsForExport } from '../utils/roster-export-fields.js';

export function RosterExportDialog({
  open,
  eventSelected = false,
  fields: fieldsOverride,
  title = 'Export roster',
  description = 'The file uses the filters already set on this page. Choose the format and the columns to include.',
  busy,
  onClose,
  onExport,
}) {
  const fields = fieldsOverride || fieldsForExport(eventSelected);
  const fieldKey = fields.map((field) => field.id).join(',');
  const [format, setFormat] = useState('pdf');
  const [selectedIds, setSelectedIds] = useState(() => fields.map((field) => field.id));

  useEffect(() => {
    if (!open) return;
    setFormat('pdf');
    setSelectedIds(fieldKey ? fieldKey.split(',') : []);
  }, [open, fieldKey]);

  useEffect(() => {
    if (!open) return undefined;

    function onKeyDown(event) {
      if (event.key === 'Escape' && !busy) onClose();
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, busy, onClose]);

  if (!open) return null;

  const allSelected = fields.every((field) => selectedIds.includes(field.id));

  function toggleField(id) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!selectedIds.length || busy) return;
    const ordered = fields.map((field) => field.id).filter((id) => selectedIds.includes(id));
    onExport({ format, fields: ordered });
  }

  return (
    <div className="event-form-dialog" role="dialog" aria-modal="true" aria-labelledby="export-options-title">
      <button
        type="button"
        className="event-form-backdrop"
        aria-label="Close export options"
        onClick={onClose}
        disabled={busy}
      />
      <div className="event-form-panel card roster-export-panel">
        <div className="event-form-head">
          <h2 id="export-options-title">{title}</h2>
          <button type="button" className="ghost event-form-close" onClick={onClose} disabled={busy}>
            Close
          </button>
        </div>
        <p className="field-hint roster-export-note">{description}</p>
        <form className="roster-export-form" onSubmit={handleSubmit}>
          <fieldset className="roster-export-format">
            <legend>Format</legend>
            <label className="choice-field">
              <input
                type="radio"
                name="export-format"
                value="pdf"
                checked={format === 'pdf'}
                onChange={() => setFormat('pdf')}
              />
              <span>PDF</span>
            </label>
            <label className="choice-field">
              <input
                type="radio"
                name="export-format"
                value="xlsx"
                checked={format === 'xlsx'}
                onChange={() => setFormat('xlsx')}
              />
              <span>Excel</span>
            </label>
          </fieldset>

          <fieldset className="roster-export-fields">
            <legend>Columns</legend>
            <div className="roster-export-field-actions">
              <button
                type="button"
                className="ghost"
                onClick={() => setSelectedIds(allSelected ? [] : fields.map((field) => field.id))}
              >
                {allSelected ? 'Clear all' : 'Select all'}
              </button>
            </div>
            <div className="roster-export-field-grid">
              {fields.map((field) => (
                <label key={field.id} className="choice-field">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(field.id)}
                    onChange={() => toggleField(field.id)}
                  />
                  <span>{field.label}</span>
                </label>
              ))}
            </div>
            {selectedIds.length === 0 ? (
              <p className="field-error" role="alert">
                Choose at least one column.
              </p>
            ) : null}
          </fieldset>

          <div className="row-actions event-form-submit-row">
            <button type="button" className="ghost" onClick={onClose} disabled={busy}>
              Cancel
            </button>
            <button type="submit" disabled={busy || selectedIds.length === 0}>
              {busy ? 'Preparing…' : format === 'pdf' ? 'Download PDF' : 'Download Excel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

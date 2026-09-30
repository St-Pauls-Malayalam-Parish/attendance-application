import { useState } from 'react';
import { AttendanceStatusFields } from './AttendanceStatusFields.jsx';

export function AttendanceRosterCard({ member, onUpdate }) {
  const [notesOpen, setNotesOpen] = useState(Boolean(member.notes));

  function handleUpdate(patch) {
    onUpdate(member.id, patch);
  }

  return (
    <article
      className={`roster-card${member.status ? '' : ' is-unmarked'}`}
      data-attendance-member={member.id}
    >
      <div className="roster-card-head">
        <h3 className="roster-card-name">{member.name}</h3>
        <p className="roster-card-voice capitalize">{member.voicePart}</p>
      </div>

      {member.status ? null : <p className="roster-card-unmarked">Not marked yet</p>}

      <div className="roster-card-status">
        <AttendanceStatusFields member={member} onUpdate={handleUpdate} />
      </div>

      <button
        type="button"
        className="ghost roster-notes-toggle"
        aria-expanded={notesOpen}
        onClick={() => setNotesOpen((open) => !open)}
      >
        {notesOpen ? 'Hide note' : member.notes ? 'Edit note' : 'Add note'}
      </button>
      {notesOpen ? (
        <label className="roster-card-notes">
          Notes
          <input
            type="text"
            className="notes-input"
            value={member.notes || ''}
            onChange={(e) => handleUpdate({ notes: e.target.value })}
            placeholder="Optional note"
            maxLength={500}
          />
        </label>
      ) : member.notes ? (
        <p className="roster-card-note-preview">{member.notes}</p>
      ) : null}
    </article>
  );
}

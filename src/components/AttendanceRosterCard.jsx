import { AttendanceStatusFields } from './AttendanceStatusFields.jsx';

export function AttendanceRosterCard({ member, onUpdate }) {
  function handleUpdate(patch) {
    onUpdate(member.id, patch);
  }

  return (
    <article className="roster-card">
      <div className="roster-card-head">
        <h3 className="roster-card-name">{member.name}</h3>
        <p className="roster-card-voice capitalize">{member.voicePart}</p>
      </div>

      <div className="roster-card-status">
        <AttendanceStatusFields member={member} onUpdate={handleUpdate} />
      </div>

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
    </article>
  );
}

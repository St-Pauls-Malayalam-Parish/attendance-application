const STATUSES = [
  { value: 'present', label: 'Present' },
  { value: 'late', label: 'Late' },
  { value: 'absent', label: 'Absent' },
  { value: 'excused', label: 'Excused' },
];

export function AttendanceRosterCard({ member, onUpdate }) {
  return (
    <article className="roster-card">
      <div className="roster-card-head">
        <h3 className="roster-card-name">{member.name}</h3>
        <p className="roster-card-voice capitalize">{member.voicePart}</p>
      </div>

      <div className="status-pills roster-card-status">
        {STATUSES.map((status) => (
          <label key={status.value} className={member.status === status.value ? 'selected' : ''}>
            <input
              type="radio"
              name={`status-${member.id}`}
              checked={member.status === status.value}
              onChange={() => onUpdate(member.id, { status: status.value })}
            />
            {status.label}
          </label>
        ))}
      </div>

      <label className="roster-card-notes">
        Notes
        <input
          type="text"
          className="notes-input"
          value={member.notes || ''}
          onChange={(e) => onUpdate(member.id, { notes: e.target.value })}
          placeholder="Optional note"
          maxLength={500}
          disabled={!member.status}
        />
      </label>
    </article>
  );
}

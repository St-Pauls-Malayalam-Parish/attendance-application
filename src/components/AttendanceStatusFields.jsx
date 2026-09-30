import { useId } from 'react';

const STATUSES = [
  { value: 'present', label: 'Present' },
  { value: 'absent', label: 'Absent' },
  { value: 'excused', label: 'Excused' },
];

export function AttendanceStatusFields({ member, onUpdate, namePrefix = 'status' }) {
  const groupId = useId();
  const isPresent = member.status === 'present';

  function setStatus(status) {
    onUpdate({
      status,
      late: status === 'present' ? member.late : false,
    });
  }

  return (
    <div className="attendance-status-fields">
      <div className="status-pills">
        {STATUSES.map((status) => (
          <label key={status.value} className={member.status === status.value ? 'selected' : ''}>
            <input
              type="radio"
              name={`${namePrefix}-${member.id}-${groupId}`}
              value={status.value}
              checked={member.status === status.value}
              onChange={() => setStatus(status.value)}
            />
            {status.label}
          </label>
        ))}
      </div>
      {isPresent ? (
        <label className="attendance-late-flag">
          <input
            type="checkbox"
            checked={Boolean(member.late)}
            onChange={(e) => onUpdate({ late: e.target.checked })}
          />
          Arrived late
        </label>
      ) : null}
    </div>
  );
}

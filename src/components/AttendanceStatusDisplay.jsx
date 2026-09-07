import { StatusBadge } from './StatusBadge.jsx';

export function isLateAttendanceRow({ status, late }) {
  return status === 'late' || Boolean(late);
}

export function AttendanceStatusDisplay({ status, late = false }) {
  const arrivedLate = isLateAttendanceRow({ status, late });

  if (arrivedLate) {
    return (
      <span className="attendance-status-display">
        <StatusBadge status="present" />
        <span className="badge attendance-late-tag">Arrived late</span>
      </span>
    );
  }

  return <StatusBadge status={status} />;
}

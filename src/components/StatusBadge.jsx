export function StatusBadge({ status }) {
  const labels = {
    present: 'Present',
    absent: 'Absent',
    late: 'Late',
    excused: 'Excused',
    upcoming: 'Upcoming',
    unmarked: 'Not marked',
  };
  return <span className={`badge status-${status}`}>{labels[status] || status}</span>;
}

import { Link } from 'react-router-dom';
import { formatChoirPathway, formatAttendanceRate } from '../api.js';
import { AttendanceStatusDisplay } from './AttendanceStatusDisplay.jsx';

export function MemberCard({
  member,
  summary,
  eventAttendance = null,
  actions,
  editing = false,
  statusLabel,
  profileTo,
}) {
  const name = profileTo ? (
    <Link to={profileTo} className="text-link">
      {member.name}
    </Link>
  ) : (
    member.name
  );

  return (
    <article className={`member-card${editing ? ' editing' : ''}`}>
      <div className="member-card-main">
        <h3 className="member-card-name">
          {name}
          {member.role === 'admin' ? <span className="roster-role-badge">Admin</span> : null}
        </h3>
        <p className="member-card-username">{member.username}</p>
        <p className="member-card-email">{member.email}</p>
      </div>

      <dl className="member-card-facts">
        <div>
          <dt>Voice</dt>
          <dd className="capitalize">{member.voicePart}</dd>
        </div>
        {member.voiceRange ? (
          <div>
            <dt>Range</dt>
            <dd>{member.voiceRange}</dd>
          </div>
        ) : null}
        {member.choirPathway ? (
          <div>
            <dt>Pathway</dt>
            <dd>{formatChoirPathway(member.choirPathway)}</dd>
          </div>
        ) : null}
        {statusLabel ? (
          <div>
            <dt>Status</dt>
            <dd className="capitalize">{statusLabel}</dd>
          </div>
        ) : null}
        {eventAttendance ? (
          <div>
            <dt>This event</dt>
            <dd>
              <AttendanceStatusDisplay status={eventAttendance.status} late={eventAttendance.late} />
            </dd>
          </div>
        ) : summary ? (
          <>
            <div>
              <dt>Rate</dt>
              <dd>{formatAttendanceRate(summary)}</dd>
            </div>
            <div>
              <dt>Present</dt>
              <dd>
                {(summary.present ?? 0) + (summary.late ?? 0)}
                {summary.late > 0 ? ` (${summary.late} late)` : ''}
              </dd>
            </div>
            {summary.absent > 0 ? (
              <div>
                <dt>Absent</dt>
                <dd>{summary.absent}</dd>
              </div>
            ) : null}
            {summary.excused > 0 ? (
              <div>
                <dt>Excused</dt>
                <dd>{summary.excused}</dd>
              </div>
            ) : null}
          </>
        ) : null}
      </dl>

      {actions ? <div className="member-card-actions">{actions}</div> : null}
    </article>
  );
}

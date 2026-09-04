export function MemberCard({ member, summary, actions, editing = false, statusLabel }) {
  return (
    <article className={`member-card${editing ? ' editing' : ''}`}>
      <div className="member-card-main">
        <h3 className="member-card-name">{member.name}</h3>
        <p className="member-card-username">{member.username}</p>
        <p className="member-card-email">{member.email}</p>
      </div>

      <dl className="member-card-facts">
        <div>
          <dt>Voice</dt>
          <dd className="capitalize">{member.voicePart}</dd>
        </div>
        {statusLabel ? (
          <div>
            <dt>Status</dt>
            <dd className="capitalize">{statusLabel}</dd>
          </div>
        ) : null}
        {summary ? (
          <>
            <div>
              <dt>Rate</dt>
              <dd>{summary.rate}%</dd>
            </div>
            <div>
              <dt>Present</dt>
              <dd>{summary.present}</dd>
            </div>
            <div>
              <dt>Late</dt>
              <dd>{summary.late}</dd>
            </div>
            <div>
              <dt>Absent</dt>
              <dd>{summary.absent}</dd>
            </div>
          </>
        ) : null}
      </dl>

      {actions ? <div className="member-card-actions">{actions}</div> : null}
    </article>
  );
}

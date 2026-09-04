import { formatDate, formatEventType } from '../api.js';
import { LiturgicalColorBadge } from './LiturgicalColorBadge.jsx';
import { StatusBadge } from './StatusBadge.jsx';

export function AttendanceHistoryCard({ row }) {
  return (
    <article className="history-card">
      <time className="history-card-date" dateTime={row.event.date}>
        {formatDate(row.event.date)}
      </time>
      <h3 className="history-card-title">{row.event.title}</h3>
      <p className="history-card-meta">
        <span>{formatEventType(row.event.type)}</span>
        {row.event.liturgicalColor ? (
          <>
            <span className="history-card-sep" aria-hidden="true">·</span>
            <LiturgicalColorBadge color={row.event.liturgicalColor} />
          </>
        ) : null}
      </p>
      <div className="history-card-footer">
        <StatusBadge status={row.status} />
        {row.notes ? <p className="history-card-notes">{row.notes}</p> : null}
      </div>
    </article>
  );
}

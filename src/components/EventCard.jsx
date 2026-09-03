import { formatDate, formatEventType } from '../api.js';
import { LiturgicalColorBadge } from './LiturgicalColorBadge.jsx';

function EventCardContent({ event }) {
  return (
    <>
      <time dateTime={event.date}>{formatDate(event.date)}</time>
      <h3>{event.title}</h3>
      <p className="event-card-meta">
        {formatEventType(event.type)}
        {event.liturgicalColor ? (
          <>
            {' · '}
            <LiturgicalColorBadge color={event.liturgicalColor} />
          </>
        ) : null}
      </p>
    </>
  );
}

export function EventCard({ event, onSelect, actions, selected = false }) {
  if (onSelect) {
    return (
      <button type="button" className="event-card" onClick={onSelect}>
        <EventCardContent event={event} />
      </button>
    );
  }

  return (
    <article className={`event-card event-card-manage${selected ? ' editing' : ''}`}>
      <div className="event-card-body">
        <EventCardContent event={event} />
      </div>
      {actions ? <div className="event-card-actions">{actions}</div> : null}
    </article>
  );
}

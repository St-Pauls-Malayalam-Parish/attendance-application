import { formatDate, formatEventType } from '../api.js';
import { LiturgicalColorBadge } from './LiturgicalColorBadge.jsx';

export function EventDetailPanel({ event, editing, actions, onClose }) {
  if (!event) {
    return (
      <div className="calendar-panel calendar-panel-empty card">
        <p className="muted">Select an event on the calendar to take attendance, edit, or delete it.</p>
      </div>
    );
  }

  return (
    <div className={`calendar-panel card${editing ? ' editing' : ''}`}>
      <div className="calendar-panel-head">
        <h3 className="calendar-panel-title">Selected event</h3>
        {onClose ? (
          <button type="button" className="ghost calendar-panel-close" onClick={onClose}>
            Close
          </button>
        ) : null}
      </div>

      <div className="calendar-event-detail">
        <p className="calendar-event-date">
          <time dateTime={event.date}>{formatDate(event.date)}</time>
        </p>
        <h4 className="calendar-panel-event-title">{event.title}</h4>
        <dl className="calendar-event-facts">
          <div className="calendar-event-fact">
            <dt>Type</dt>
            <dd>{formatEventType(event.type)}</dd>
          </div>
          <div className="calendar-event-fact">
            <dt>Liturgical color</dt>
            <dd>
              {event.liturgicalColor ? (
                <LiturgicalColorBadge color={event.liturgicalColor} />
              ) : (
                <span className="muted">Not set</span>
              )}
            </dd>
          </div>
        </dl>
      </div>

      {actions ? <div className="calendar-event-actions">{actions}</div> : null}
    </div>
  );
}

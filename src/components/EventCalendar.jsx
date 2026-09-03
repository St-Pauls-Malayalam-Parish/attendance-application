import {
  buildMonthGrid,
  eventsForDay,
  formatEventTime,
  formatMonthYear,
  sameDay,
} from '../utils/calendar.js';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MAX_VISIBLE_EVENTS = 3;
const LITURGICAL_COLORS = new Set(['white', 'green', 'purple', 'red', 'black']);

function liturgicalColorKey(color) {
  return LITURGICAL_COLORS.has(color) ? color : 'none';
}

export function EventCalendar({
  events,
  month,
  selectedEventId,
  onMonthChange,
  onEventSelect,
}) {
  const today = new Date();
  const cells = buildMonthGrid(month);

  function shiftMonth(offset) {
    onMonthChange(new Date(month.getFullYear(), month.getMonth() + offset, 1));
  }

  return (
    <div className="event-calendar">
      <div className="calendar-header">
        <div className="calendar-nav">
          <button type="button" className="ghost calendar-nav-btn" onClick={() => shiftMonth(-1)}>
            ←
          </button>
          <button type="button" className="ghost calendar-nav-btn" onClick={() => shiftMonth(1)}>
            →
          </button>
        </div>
        <h3 className="calendar-title">{formatMonthYear(month)}</h3>
        <button
          type="button"
          className="ghost calendar-today-btn"
          onClick={() => onMonthChange(new Date(today.getFullYear(), today.getMonth(), 1))}
        >
          Today
        </button>
      </div>

      <div className="calendar-grid" role="grid" aria-label={formatMonthYear(month)}>
        {WEEKDAYS.map((weekday) => (
          <div key={weekday} className="calendar-weekday" role="columnheader">
            {weekday}
          </div>
        ))}

        {cells.map((cell) => {
          if (cell.type === 'padding') {
            return <div key={cell.key} className="calendar-day padding" aria-hidden="true" />;
          }

          const dayEvents = eventsForDay(events, cell.date);
          const isToday = sameDay(cell.date, today);
          const hiddenCount = Math.max(0, dayEvents.length - MAX_VISIBLE_EVENTS);

          return (
            <div
              key={cell.key}
              className={`calendar-day${isToday ? ' today' : ''}`}
              role="gridcell"
            >
              <span className="calendar-day-num">{cell.date.getDate()}</span>
              <div className="calendar-day-events">
                {dayEvents.slice(0, MAX_VISIBLE_EVENTS).map((event) => (
                  <button
                    key={event.id}
                    type="button"
                    className={`calendar-event${selectedEventId === event.id ? ' selected' : ''}`}
                    data-liturgical-color={liturgicalColorKey(event.liturgicalColor)}
                    onClick={() => onEventSelect(event)}
                    title={event.title}
                  >
                    <span className="calendar-event-time">{formatEventTime(event.date)}</span>
                    <span className="calendar-event-title">{event.title}</span>
                  </button>
                ))}
                {hiddenCount > 0 ? (
                  <span className="calendar-more">+{hiddenCount} more</span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

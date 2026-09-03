export function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function toISODate(date) {
  const value = date instanceof Date ? date : new Date(date);
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function monthFilterRange(monthDate, fromFilter = '', toFilter = '') {
  const monthStart = startOfMonth(monthDate);
  const monthEnd = endOfMonth(monthDate);
  let from = toISODate(monthStart);
  let to = toISODate(monthEnd);

  if (fromFilter) {
    if (fromFilter > to) return null;
    if (fromFilter > from) from = fromFilter;
  }

  if (toFilter) {
    if (toFilter < from) return null;
    if (toFilter < to) to = toFilter;
  }

  return { from, to };
}

export function sameDay(left, right) {
  return toISODate(left) === toISODate(right);
}

export function buildMonthGrid(monthDate) {
  const first = startOfMonth(monthDate);
  const last = endOfMonth(monthDate);
  const startPad = first.getDay();
  const daysInMonth = last.getDate();
  const cells = [];

  for (let index = 0; index < startPad; index += 1) {
    cells.push({ type: 'padding', key: `pad-start-${index}` });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({
      type: 'day',
      date: new Date(monthDate.getFullYear(), monthDate.getMonth(), day),
      key: `day-${day}`,
    });
  }

  while (cells.length % 7 !== 0) {
    cells.push({ type: 'padding', key: `pad-end-${cells.length}` });
  }

  return cells;
}

export function eventsForDay(events, day) {
  return events.filter((event) => sameDay(new Date(event.date), day));
}

export function formatMonthYear(date) {
  return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

export function formatEventTime(value) {
  return new Date(value).toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

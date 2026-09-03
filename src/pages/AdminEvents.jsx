import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, EVENT_TYPES, LITURGICAL_COLORS, toDateTimeLocal } from '../api.js';
import { EventCard } from '../components/EventCard.jsx';
import { EventCalendar } from '../components/EventCalendar.jsx';
import { EventDetailPanel } from '../components/EventDetailPanel.jsx';
import { ConfirmDialog } from '../components/ConfirmDialog.jsx';
import { EventFiltersForm } from '../components/EventFiltersForm.jsx';
import { Pagination } from '../components/Pagination.jsx';
import { ViewToggle } from '../components/ViewToggle.jsx';
import {
  emptyEventFilters,
  eventFiltersToParams,
  filtersAreActive,
} from '../utils/event-filters.js';
import { formatMonthYear, monthFilterRange, startOfMonth } from '../utils/calendar.js';
import { PAGE_SIZE_OPTIONS } from '../utils/pagination.js';

const CALENDAR_EVENT_LIMIT = 100;

const emptyForm = () => ({
  title: '',
  date: toDateTimeLocal(),
  type: 'practice',
  liturgicalColor: '',
  notes: '',
});

const emptyPagination = () => ({
  page: 1,
  pageSize: 10,
  total: 0,
  totalPages: 1,
  rangeStart: 0,
  rangeEnd: 0,
  hasPrevious: false,
  hasNext: false,
});

export function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [years, setYears] = useState([]);
  const [pagination, setPagination] = useState(emptyPagination);
  const [totalUnfiltered, setTotalUnfiltered] = useState(0);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState('');
  const [form, setForm] = useState(() => emptyForm());
  const [filters, setFilters] = useState(emptyEventFilters);
  const [searchDraft, setSearchDraft] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
  const [viewMode, setViewMode] = useState('calendar');
  const [calendarMonth, setCalendarMonth] = useState(() => startOfMonth(new Date()));
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [selectedCalendarEventId, setSelectedCalendarEventId] = useState(null);
  const [calendarDetailOpen, setCalendarDetailOpen] = useState(false);

  const filtersActive = useMemo(() => filtersAreActive(filters), [filters]);
  const selectedCalendarEvent = useMemo(
    () => calendarEvents.find((event) => event.id === selectedCalendarEventId) ?? null,
    [calendarEvents, selectedCalendarEventId]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((current) => ({ ...current, search: searchDraft }));
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchDraft]);

  async function loadYears() {
    const data = await api('/api/events/years');
    setYears(data.years);
  }

  async function loadCalendarEvents(nextMonth = calendarMonth, nextFilters = filters) {
    const range = monthFilterRange(nextMonth, nextFilters.from, nextFilters.to);

    if (!range) {
      setCalendarEvents([]);
      setPagination((current) => ({ ...current, total: 0 }));
      setSelectedCalendarEventId(null);
      return { events: [], pagination: { total: 0 }, meta: { totalUnfiltered } };
    }

    const params = eventFiltersToParams(
      { ...nextFilters, from: range.from, to: range.to },
      { page: 1, pageSize: CALENDAR_EVENT_LIMIT }
    );

    const data = await api(`/api/events?${params}`);
    setCalendarEvents(data.events);
    setTotalUnfiltered(data.meta.totalUnfiltered);
    setPagination((current) => ({ ...current, total: data.pagination.total }));
    setSelectedCalendarEventId((current) =>
      data.events.some((event) => event.id === current) ? current : null
    );
    return data;
  }

  async function loadEvents(nextPage = page, nextPageSize = pageSize, nextFilters = filters) {
    const params = eventFiltersToParams(nextFilters, { page: nextPage, pageSize: nextPageSize });
    const data = await api(`/api/events?${params}`);
    setEvents(data.events);
    setPagination(data.pagination);
    setTotalUnfiltered(data.meta.totalUnfiltered);
    if (data.pagination.page !== nextPage) {
      setPage(data.pagination.page);
    }
    return data;
  }

  useEffect(() => {
    loadYears().catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const loader =
      viewMode === 'calendar'
        ? loadCalendarEvents(calendarMonth, filters)
        : loadEvents(page, pageSize, filters);

    loader
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, pageSize, filters, viewMode, calendarMonth]);

  function updateFilter(key, value) {
    if (key === 'search') {
      setSearchDraft(value);
      return;
    }
    if (key === 'year' && value) {
      setCalendarMonth(new Date(Number(value), calendarMonth.getMonth(), 1));
    }
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  }

  function clearFilters() {
    setSearchDraft('');
    setFilters(emptyEventFilters());
    setPage(1);
  }

  function handlePageSizeChange(nextPageSize) {
    setPageSize(nextPageSize);
    setPage(1);
  }

  async function refreshAfterMutation() {
    if (viewMode === 'calendar') {
      await Promise.all([loadCalendarEvents(calendarMonth, filters), loadYears()]);
      return;
    }
    await Promise.all([loadEvents(page, pageSize, filters), loadYears()]);
  }

  function renderEventActions(event, { onAction } = {}) {
    function run(action) {
      onAction?.();
      action();
    }

    return (
      <>
        <Link
          to={`/admin/attendance/${event.id}`}
          className="table-action primary"
          onClick={() => onAction?.()}
        >
          Take attendance
        </Link>
        <div className="table-actions-row">
          <button
            type="button"
            className="ghost table-action"
            onClick={() => run(() => startEdit(event))}
          >
            Edit
          </button>
          <button
            type="button"
            className="ghost danger table-action"
            onClick={() => run(() => setDeleteId(event.id))}
          >
            Delete
          </button>
        </div>
      </>
    );
  }

  function handleCalendarEventSelect(event) {
    setSelectedCalendarEventId(event.id);
    setCalendarDetailOpen(true);
  }

  function closeCalendarDetail() {
    setCalendarDetailOpen(false);
  }

  function startEdit(event) {
    setError('');
    setSaved('');
    setEditingId(event.id);
    setForm({
      title: event.title,
      date: toDateTimeLocal(event.date),
      type: event.type,
      liturgicalColor: event.liturgicalColor || '',
      notes: event.notes || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm());
  }

  async function onSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setSaved('');
    try {
      if (editingId) {
        await api(`/api/events/${editingId}`, { method: 'PATCH', body: form });
        setSaved('Event updated');
        cancelEdit();
      } else {
        await api('/api/events', { method: 'POST', body: form });
        setForm(emptyForm());
        setSaved('Event added');
      }
      await refreshAfterMutation();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function confirmDelete() {
    if (!deleteId) return;
    setBusy(true);
    setError('');
    try {
      if (editingId === deleteId) cancelEdit();
      await api(`/api/events/${deleteId}`, { method: 'DELETE' });
      setDeleteId(null);
      setSaved('Event deleted');
      await refreshAfterMutation();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <section className="page-head">
        <div>
          <p className="eyebrow">Events</p>
          <h1>Practices and services</h1>
          <p className="lede">Create events, then mark who was present from Take attendance.</p>
        </div>
      </section>

      {error ? <p className="alert">{error}</p> : null}
      {saved ? <p className="ok">{saved}</p> : null}

      <form className="card form grid-form" onSubmit={onSubmit}>
        <h2 className="span-2">{editingId ? 'Edit event' : 'Add event'}</h2>
        <label>
          Title
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Friday practice"
            required
          />
        </label>
        <label>
          Date and time
          <input
            type="datetime-local"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            required
          />
        </label>
        <label>
          Type
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            {EVENT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Liturgical colour
          <select
            value={form.liturgicalColor}
            onChange={(e) => setForm({ ...form, liturgicalColor: e.target.value })}
          >
            {LITURGICAL_COLORS.map((color) => (
              <option key={color.value || 'none'} value={color.value}>
                {color.label}
              </option>
            ))}
          </select>
        </label>
        <label className="span-2">
          Notes
          <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </label>
        <div className="row-actions span-2">
          <button type="submit" disabled={busy}>
            {busy ? 'Saving…' : editingId ? 'Save changes' : 'Add event'}
          </button>
          {editingId ? (
            <button type="button" className="ghost" onClick={cancelEdit} disabled={busy}>
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      <div className="card events-card">
        <div className="events-card-head">
          <h2>Upcoming and past</h2>
          <ViewToggle
            value={viewMode}
            onChange={setViewMode}
            options={[
              { value: 'calendar', label: 'Calendar' },
              { value: 'tiles', label: 'Tiles' },
            ]}
          />
        </div>

        <EventFiltersForm
          searchDraft={searchDraft}
          filters={filters}
          years={years}
          filtersActive={filtersActive}
          onSearchChange={(value) => updateFilter('search', value)}
          onFilterChange={updateFilter}
          onClear={clearFilters}
        />

        <p className="muted filter-summary">
          {viewMode === 'calendar'
            ? `${pagination.total} event${pagination.total === 1 ? '' : 's'} in ${formatMonthYear(calendarMonth)}${filtersActive ? ' match these filters' : ''}`
            : `${pagination.total} of ${totalUnfiltered} event${totalUnfiltered === 1 ? '' : 's'} match${filtersActive ? ' these filters' : ''}`}
        </p>

        {loading ? (
          <p className="muted">Loading events…</p>
        ) : viewMode === 'calendar' ? (
          <>
            {calendarEvents.length === 0 ? (
              <p className="muted">
                No events in {formatMonthYear(calendarMonth)}
                {filtersActive ? ' match these filters' : ''}.
              </p>
            ) : null}

            <div className="calendar-layout">
              <div className="calendar-layout-main">
                <EventCalendar
                  events={calendarEvents}
                  month={calendarMonth}
                  selectedEventId={selectedCalendarEventId}
                  onMonthChange={setCalendarMonth}
                  onEventSelect={handleCalendarEventSelect}
                />
              </div>

              <aside className="calendar-layout-panel">
                <EventDetailPanel
                  event={selectedCalendarEvent}
                  editing={editingId === selectedCalendarEvent?.id}
                  actions={
                    selectedCalendarEvent
                      ? renderEventActions(selectedCalendarEvent)
                      : null
                  }
                />
              </aside>
            </div>

            {calendarDetailOpen && selectedCalendarEvent ? (
              <div className="calendar-detail-dialog" role="dialog" aria-modal="true">
                <button
                  type="button"
                  className="calendar-detail-backdrop"
                  aria-label="Close event details"
                  onClick={closeCalendarDetail}
                />
                <div className="calendar-detail-sheet">
                  <EventDetailPanel
                    event={selectedCalendarEvent}
                    editing={editingId === selectedCalendarEvent.id}
                    actions={renderEventActions(selectedCalendarEvent, {
                      onAction: closeCalendarDetail,
                    })}
                    onClose={closeCalendarDetail}
                  />
                </div>
              </div>
            ) : null}
          </>
        ) : pagination.total === 0 ? (
          <p className="muted">No events match these filters.</p>
        ) : (
          <>
            <div className="event-cards">
              {events.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  selected={editingId === event.id}
                  actions={renderEventActions(event)}
                />
              ))}
            </div>

            <Pagination
              page={pagination.page}
              pageSize={pagination.pageSize}
              totalItems={pagination.total}
              totalPages={pagination.totalPages}
              rangeStart={pagination.rangeStart}
              rangeEnd={pagination.rangeEnd}
              hasPrevious={pagination.hasPrevious}
              hasNext={pagination.hasNext}
              onPageChange={setPage}
              onPageSizeChange={handlePageSizeChange}
              itemLabel="events"
              disabled={loading}
            />
          </>
        )}
      </div>

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => {
          if (!open && !busy) setDeleteId(null);
        }}
        title="Delete this event?"
        description="This removes the event and all attendance records for it. This cannot be undone."
        confirmLabel="Delete event"
        cancelLabel="Keep event"
        danger
        busy={busy}
        onConfirm={confirmDelete}
      />
    </>
  );
}

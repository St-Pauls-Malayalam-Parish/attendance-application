import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, formatDate, formatEventType } from '../api.js';
import { ConfirmDialog } from '../components/ConfirmDialog.jsx';
import { StatusMessage } from '../components/StatusMessage.jsx';
import { useConfirmDialog } from '../hooks/useConfirmDialog.js';
import { EventCard } from '../components/EventCard.jsx';
import { EventFiltersForm } from '../components/EventFiltersForm.jsx';
import { FilterPanel } from '../components/FilterPanel.jsx';
import { AttendanceRosterCard } from '../components/AttendanceRosterCard.jsx';
import { RosterFiltersForm } from '../components/RosterFiltersForm.jsx';
import { LiturgicalColorBadge } from '../components/LiturgicalColorBadge.jsx';
import { Pagination } from '../components/Pagination.jsx';
import {
  normalizeAttendanceEvent,
  normalizeEventsList,
} from '../utils/api-data.js';
import {
  emptyEventFilters,
  eventFiltersToParams,
  filtersAreActive,
} from '../utils/event-filters.js';

const STATUSES = [
  { value: 'present', label: 'Present' },
  { value: 'late', label: 'Late' },
  { value: 'absent', label: 'Absent' },
  { value: 'excused', label: 'Excused' },
];

const EVENT_PAGE_SIZE = 12;

export function AdminAttendance() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [years, setYears] = useState([]);
  const [filters, setFilters] = useState(emptyEventFilters);
  const [searchDraft, setSearchDraft] = useState('');
  const [eventPage, setEventPage] = useState(1);
  const [eventPagination, setEventPagination] = useState({
    total: 0,
    totalPages: 1,
    hasPrevious: false,
    hasNext: false,
    rangeStart: 0,
    rangeEnd: 0,
  });
  const [totalUnfiltered, setTotalUnfiltered] = useState(0);
  const [loadingEvents, setLoadingEvents] = useState(!eventId);
  const [roster, setRoster] = useState([]);
  const [rosterSearch, setRosterSearch] = useState('');
  const [rosterVoicePart, setRosterVoicePart] = useState('');
  const [event, setEvent] = useState(null);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState('');
  const { confirm, confirmProps } = useConfirmDialog({
    onError: (err) => setError(err.message),
  });

  const filtersActive = useMemo(() => filtersAreActive(filters), [filters]);
  const activeFilterCount = useMemo(
    () => Object.values(filters).filter(Boolean).length,
    [filters]
  );
  const filteredRoster = useMemo(() => {
    const query = rosterSearch.trim().toLowerCase();

    return roster.filter((member) => {
      if (rosterVoicePart && member.voicePart !== rosterVoicePart) {
        return false;
      }
      if (!query) {
        return true;
      }
      const haystack = [member.name, member.email].join(' ').toLowerCase();
      return haystack.includes(query);
    });
  }, [roster, rosterSearch, rosterVoicePart]);
  const rosterFiltersActive = Boolean(rosterSearch.trim() || rosterVoicePart);
  const activeRosterFilterCount = [rosterSearch.trim(), rosterVoicePart].filter(Boolean).length;

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((current) => ({ ...current, search: searchDraft }));
      setEventPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchDraft]);

  useEffect(() => {
    if (eventId) return undefined;
    api('/api/events/years')
      .then((data) => setYears(Array.isArray(data.years) ? data.years : []))
      .catch((err) => setError(err.message));
    return undefined;
  }, [eventId]);

  useEffect(() => {
    if (eventId) return undefined;

    let cancelled = false;
    setLoadingEvents(true);
    const params = eventFiltersToParams(filters, { page: eventPage, pageSize: EVENT_PAGE_SIZE });

    api(`/api/events?${params}`)
      .then((data) => {
        if (cancelled) return;
        const normalized = normalizeEventsList(data, EVENT_PAGE_SIZE);
        setEvents(normalized.events);
        setEventPagination(normalized.pagination);
        setTotalUnfiltered(normalized.totalUnfiltered);
        if (normalized.pagination.page !== eventPage) {
          setEventPage(normalized.pagination.page);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoadingEvents(false);
      });

    return () => {
      cancelled = true;
    };
  }, [eventId, filters, eventPage]);

  useEffect(() => {
    if (!eventId) {
      setRoster([]);
      setRosterSearch('');
      setRosterVoicePart('');
      setEvent(null);
      return undefined;
    }

    setSaved('');
    setError('');
    setRosterSearch('');
    setRosterVoicePart('');
    api(`/api/attendance/event/${eventId}`)
      .then((data) => {
        const normalized = normalizeAttendanceEvent(data);
        setEvent(normalized.event);
        setRoster(normalized.roster);
      })
      .catch((err) => setError(err.message));

    return undefined;
  }, [eventId]);

  function updateFilter(key, value) {
    if (key === 'search') {
      setSearchDraft(value);
      return;
    }
    setFilters((current) => ({ ...current, [key]: value }));
    setEventPage(1);
  }

  function clearFilters() {
    setSearchDraft('');
    setFilters(emptyEventFilters());
    setEventPage(1);
  }

  function updateRow(memberId, patch) {
    setRoster((current) =>
      current.map((row) => (row.id === memberId ? { ...row, ...patch } : row))
    );
  }

  function clearRosterFilters() {
    setRosterSearch('');
    setRosterVoicePart('');
  }

  function requestSave() {
    setError('');
    setSaved('');
    const markedCount = roster.filter((row) => row.status).length;

    confirm({
      title: 'Save attendance?',
      description: `This updates attendance for ${markedCount} marked member${markedCount === 1 ? '' : 's'} on this event.`,
      confirmLabel: 'Save attendance',
      cancelLabel: 'Keep editing',
      tone: 'primary',
      action: async () => {
        const records = roster
          .filter((row) => row.status)
          .map((row) => ({
            userId: row.id,
            status: row.status,
            notes: row.notes || '',
          }));
        await api(`/api/attendance/event/${eventId}`, { method: 'PUT', body: { records } });
        setSaved('Attendance saved');
      },
    });
  }

  if (!eventId) {
    return (
      <>
        <section className="page-head">
          <div>
            <p className="eyebrow">Take attendance</p>
            <h1>Take attendance</h1>
            <p className="lede">Choose a practice or service, then mark who was present.</p>
          </div>
        </section>

        {error ? <p className="alert">{error}</p> : null}

        <div className="card events-card">
          <h2>Upcoming and past</h2>

          <FilterPanel activeCount={activeFilterCount}>
            <EventFiltersForm
              searchDraft={searchDraft}
              filters={filters}
              years={years}
              filtersActive={filtersActive}
              onSearchChange={(value) => updateFilter('search', value)}
              onFilterChange={updateFilter}
              onClear={clearFilters}
            />
          </FilterPanel>

          <p className="muted filter-summary">
            {eventPagination.total} of {totalUnfiltered} event{totalUnfiltered === 1 ? '' : 's'} match
            {filtersActive ? ' these filters' : ''}
          </p>

          {loadingEvents ? (
            <p className="muted">Loading events…</p>
          ) : eventPagination.total === 0 ? (
            <p className="muted">No events match these filters.</p>
          ) : (
            <>
              <div className="event-cards">
                {events.map((item) => (
                  <EventCard
                    key={item.id}
                    event={item}
                    onSelect={() => navigate(`/admin/attendance/${item.id}`)}
                  />
                ))}
              </div>

              <Pagination
                page={eventPagination.page}
                pageSize={EVENT_PAGE_SIZE}
                totalItems={eventPagination.total}
                totalPages={eventPagination.totalPages}
                rangeStart={eventPagination.rangeStart}
                rangeEnd={eventPagination.rangeEnd}
                hasPrevious={eventPagination.hasPrevious}
                hasNext={eventPagination.hasNext}
                onPageChange={setEventPage}
                onPageSizeChange={() => {}}
                showPageSize={false}
                itemLabel="events"
                disabled={loadingEvents}
              />
            </>
          )}
        </div>
      </>
    );
  }

  return (
    <>
      <section className="page-head">
        <div>
          <p className="eyebrow">Take attendance</p>
          <h1>Take attendance</h1>
          <p className="lede">
            Mark each singer and add a short note if needed (for example, arrived late or excused
            for travel).
          </p>
        </div>
      </section>

      {error ? <p className="alert">{error}</p> : null}

      <p className="back-link">
        <Link to="/admin/attendance">← All events</Link>
      </p>

      {event ? (
        <>
        <div className="card attendance-card">
          <div className="toolbar attendance-event-head">
            <div>
              <h2>{event.title}</h2>
              <p className="muted">
                {formatDate(event.date)} · {formatEventType(event.type)}
                {event.liturgicalColor ? (
                  <>
                    {' · '}
                    <LiturgicalColorBadge color={event.liturgicalColor} />
                  </>
                ) : null}
              </p>
            </div>
            <button
              type="button"
              className="attendance-save-desktop"
              onClick={requestSave}
              disabled={confirmProps.busy}
            >
              {confirmProps.busy ? 'Saving…' : 'Save attendance'}
            </button>
          </div>
          <StatusMessage
            message={saved}
            className="attendance-save-message"
            onDismiss={() => setSaved('')}
          />

          <FilterPanel activeCount={activeRosterFilterCount}>
            <RosterFiltersForm
              searchDraft={rosterSearch}
              voicePart={rosterVoicePart}
              filtersActive={rosterFiltersActive}
              onSearchChange={setRosterSearch}
              onVoicePartChange={setRosterVoicePart}
              onClear={clearRosterFilters}
            />
          </FilterPanel>

          <p className="muted filter-summary">
            {rosterFiltersActive
              ? `${filteredRoster.length} of ${roster.length} member${roster.length === 1 ? '' : 's'} match these filters`
              : `${roster.length} member${roster.length === 1 ? '' : 's'}`}
          </p>

          {filteredRoster.length === 0 ? (
            <p className="muted">No members match these filters.</p>
          ) : (
          <div className="data-list">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Voice</th>
                  <th>Status</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {filteredRoster.map((member) => (
                  <tr key={member.id}>
                    <td>{member.name}</td>
                    <td className="capitalize">{member.voicePart}</td>
                    <td>
                      <div className="status-pills">
                        {STATUSES.map((status) => (
                          <label key={status.value} className={member.status === status.value ? 'selected' : ''}>
                            <input
                              type="radio"
                              name={`status-${member.id}`}
                              checked={member.status === status.value}
                              onChange={() => updateRow(member.id, { status: status.value })}
                            />
                            {status.label}
                          </label>
                        ))}
                      </div>
                    </td>
                    <td>
                      <input
                        type="text"
                        className="notes-input"
                        value={member.notes || ''}
                        onChange={(e) => updateRow(member.id, { notes: e.target.value })}
                        placeholder="Optional note"
                        maxLength={500}
                        disabled={!member.status}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="data-cards">
              {filteredRoster.map((member) => (
                <AttendanceRosterCard key={member.id} member={member} onUpdate={updateRow} />
              ))}
            </div>
          </div>
          )}
        </div>

        <div className="attendance-save-bar" aria-live="polite">
          <StatusMessage
            message={saved}
            className="attendance-save-feedback"
            onDismiss={() => setSaved('')}
          />
          <button type="button" onClick={requestSave} disabled={confirmProps.busy}>
            {confirmProps.busy ? 'Saving…' : 'Save attendance'}
          </button>
        </div>

        <ConfirmDialog {...confirmProps} />
        </>
      ) : (
        <p className="muted">Loading attendance…</p>
      )}
    </>
  );
}

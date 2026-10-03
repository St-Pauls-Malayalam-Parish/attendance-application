import { useEffect, useState } from 'react';
import { api, downloadApiFile, formatDate, formatEventType, formatAttendanceRate } from '../api.js';
import { AttendanceStatusDisplay } from '../components/AttendanceStatusDisplay.jsx';
import { LiturgicalColorBadge } from '../components/LiturgicalColorBadge.jsx';
import { AttendanceHistoryCard } from '../components/AttendanceHistoryCard.jsx';
import { FilterPanel } from '../components/FilterPanel.jsx';
import { Pagination } from '../components/Pagination.jsx';
import { DateRangeFilters } from '../components/DateRangeFilters.jsx';
import { RosterExportDialog } from '../components/RosterExportDialog.jsx';
import { useAuth } from '../AuthContext.jsx';
import { PAGE_SIZE_OPTIONS } from '../utils/pagination.js';
import { normalizeAttendanceMe } from '../utils/api-data.js';
import { ATTENDANCE_EXPORT_FIELDS } from '../utils/attendance-export-fields.js';

export function MemberHome() {
  const { user, setUser } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [searchDraft, setSearchDraft] = useState('');
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [liturgicalColor, setLiturgicalColor] = useState('');
  const [status, setStatus] = useState('');
  const [eventId, setEventId] = useState('');
  const [events, setEvents] = useState([]);
  const [exportOpen, setExportOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
  const pending = user.approvalStatus === 'pending';
  const filtersActive = Boolean(from || to || search || type || liturgicalColor || status || eventId);
  const activeFilterCount = [from, to, search, type, liturgicalColor, status, eventId].filter(Boolean).length;

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchDraft);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchDraft]);

  useEffect(() => {
    if (!pending) return undefined;
    const timer = setInterval(() => {
      api('/api/auth/me')
        .then((result) => setUser(result.user))
        .catch(() => {});
    }, 8000);
    return () => clearInterval(timer);
  }, [pending, setUser]);

  useEffect(() => {
    if (pending) return undefined;
    api('/api/events?limit=100')
      .then((result) => setEvents(Array.isArray(result.events) ? result.events : []))
      .catch(() => setEvents([]));
    return undefined;
  }, [pending]);

  useEffect(() => {
    if (pending) {
      setData(null);
      return undefined;
    }
    const params = historyParams({ page, pageSize });
    api(`/api/attendance/me?${params}`)
      .then((result) => {
        const normalized = normalizeAttendanceMe(result);
        setData(normalized);
        if (normalized.pagination.page && normalized.pagination.page !== page) {
          setPage(normalized.pagination.page);
        }
      })
      .catch((err) => setError(err.message));
    return undefined;
  }, [pending, from, to, search, type, liturgicalColor, status, eventId, page, pageSize]);

  function historyParams({ page: nextPage, pageSize: nextPageSize } = {}) {
    const params = new URLSearchParams();
    if (eventId) {
      params.set('eventId', eventId);
    } else {
      if (from) params.set('from', from);
      if (to) params.set('to', to);
    }
    if (search.trim()) params.set('search', search.trim());
    if (type) params.set('type', type);
    if (liturgicalColor) params.set('liturgicalColor', liturgicalColor);
    if (status) params.set('status', status);
    if (nextPage) params.set('page', String(nextPage));
    if (nextPageSize) params.set('limit', String(nextPageSize));
    return params;
  }

  function applyRange(nextFrom, nextTo) {
    setError('');
    setFrom(nextFrom);
    setTo(nextTo);
    setPage(1);
  }

  function handleFromChange(value) {
    setError('');
    setFrom(value);
    setPage(1);
  }

  function handleToChange(value) {
    setError('');
    setTo(value);
    setPage(1);
  }

  function clearFilters() {
    setSearchDraft('');
    setSearch('');
    setType('');
    setLiturgicalColor('');
    setStatus('');
    setEventId('');
    applyRange('', '');
  }

  function handleEventChange(value) {
    setError('');
    setEventId(value);
    if (value) {
      setFrom('');
      setTo('');
    }
    setPage(1);
  }

  async function exportHistory({ format, fields }) {
    setError('');
    setExporting(true);
    try {
      const params = historyParams();
      params.set('format', format);
      params.set('fields', fields.join(','));
      await downloadApiFile(`/api/attendance/me/export?${params}`);
      setExportOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setExporting(false);
    }
  }

  function handleTypeChange(value) {
    setError('');
    setType(value);
    setPage(1);
  }

  function handleLiturgicalColorChange(value) {
    setError('');
    setLiturgicalColor(value);
    setPage(1);
  }

  function handleStatusChange(value) {
    setError('');
    setStatus(value);
    setPage(1);
  }

  return (
    <>
      <section className="page-head">
        <div>
          <p className="eyebrow">My attendance</p>
          <h1>{user.name}</h1>
          <p className="lede">
            {pending
              ? 'Your registration is waiting for a choir admin to approve it.'
              : 'This page shows only your attendance. Other singers cannot see it.'}
          </p>
        </div>
      </section>

      {error ? <p className="alert">{error}</p> : null}

      {pending ? (
        <div className="card pending-card">
          <h2>Waiting for approval</h2>
          <p>
            You can sign in, but you are not on the choir roster yet. A choir admin will review your
            request. This page will update automatically once you are approved.
          </p>
        </div>
      ) : data ? (
        <>
          <div className="stats">
            <article className="stat">
              <strong>{formatAttendanceRate(data.summary)}</strong>
              <span>Attendance rate</span>
            </article>
            <article className="stat">
              <strong>{(data.summary.present ?? 0) + (data.summary.late ?? 0)}</strong>
              <span>Present</span>
              {data.summary.late > 0 ? (
                <span className="stat-detail">
                  {data.summary.late} arrived late
                </span>
              ) : null}
            </article>
            <article className="stat">
              <strong>{data.summary.absent}</strong>
              <span>Absent</span>
            </article>
            {data.summary.excused > 0 ? (
              <article className="stat">
                <strong>{data.summary.excused}</strong>
                <span>Excused</span>
              </article>
            ) : null}
          </div>
          <p className="muted attendance-rate-note">
            The rate is present divided by present plus absent. Arrived late still counts as present.
            Excused services are left out.
          </p>

          <div className="card attendance-history-card">
            <h2>Your history</h2>

            <FilterPanel activeCount={activeFilterCount}>
              <DateRangeFilters
                showSearch
                showEventFilters
                searchDraft={searchDraft}
                onSearchChange={setSearchDraft}
                type={type}
                onTypeChange={handleTypeChange}
                liturgicalColor={liturgicalColor}
                onLiturgicalColorChange={handleLiturgicalColorChange}
                status={status}
                onStatusChange={handleStatusChange}
                events={events.map((event) => ({
                  id: event.id,
                  label: `${formatDate(event.date)} · ${event.title}`,
                }))}
                eventId={eventId}
                onEventChange={handleEventChange}
                from={from}
                to={to}
                filtersActive={filtersActive}
                onFromChange={handleFromChange}
                onToChange={handleToChange}
                onClear={clearFilters}
                onApplyRange={applyRange}
              />
            </FilterPanel>

            <div className="roster-export-bar">
              <p className="muted filter-summary">
                {data.pagination.total} of {data.meta?.totalUnfiltered ?? data.pagination.total}{' '}
                {data.pagination.total === 1 ? 'event matches' : 'events match'}
                {filtersActive ? ' these filters' : ''}
                {data.meta?.event ? ` for ${data.meta.event.title}` : ''}.
              </p>
              <div className="roster-export-actions">
                <button type="button" className="ghost" onClick={() => setExportOpen(true)} disabled={exporting}>
                  {exporting ? 'Preparing…' : 'Export'}
                </button>
              </div>
            </div>

            {data.pagination.total === 0 ? (
              <p className="muted">No events match these filters.</p>
            ) : (
              <>
                <div className="data-list">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Event</th>
                        <th>Type</th>
                        <th>Liturgical color</th>
                        <th>Attendance</th>
                        <th>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.history.map((row) => (
                        <tr key={row.event.id}>
                          <td>{formatDate(row.event.date)}</td>
                          <td>{row.event.title}</td>
                          <td>{formatEventType(row.event.type)}</td>
                          <td>
                            <LiturgicalColorBadge color={row.event.liturgicalColor} />
                          </td>
                          <td>
                            <AttendanceStatusDisplay status={row.status} late={row.late} />
                          </td>
                          <td className="notes-cell">{row.notes || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="data-cards">
                    {data.history.map((row) => (
                      <AttendanceHistoryCard key={row.event.id} row={row} />
                    ))}
                  </div>
                </div>

                <Pagination
                  page={data.pagination.page}
                  pageSize={data.pagination.pageSize}
                  totalItems={data.pagination.total}
                  totalPages={data.pagination.totalPages}
                  rangeStart={data.pagination.rangeStart}
                  rangeEnd={data.pagination.rangeEnd}
                  hasPrevious={data.pagination.hasPrevious}
                  hasNext={data.pagination.hasNext}
                  onPageChange={setPage}
                  onPageSizeChange={(nextPageSize) => {
                    setPageSize(nextPageSize);
                    setPage(1);
                  }}
                  itemLabel="events"
                />
              </>
            )}
          </div>
        </>
      ) : (
        <p className="muted">Loading your attendance…</p>
      )}

      <RosterExportDialog
        open={exportOpen}
        fields={ATTENDANCE_EXPORT_FIELDS}
        title="Export your history"
        description="The file uses the filters already set on this page, including a selected event. Choose the format and the columns to include."
        busy={exporting}
        onClose={() => {
          if (!exporting) setExportOpen(false);
        }}
        onExport={exportHistory}
      />
    </>
  );
}

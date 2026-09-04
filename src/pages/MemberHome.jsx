import { useEffect, useState } from 'react';
import { api, formatDate, formatEventType } from '../api.js';
import { Shell } from '../components/Shell.jsx';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { LiturgicalColorBadge } from '../components/LiturgicalColorBadge.jsx';
import { Pagination } from '../components/Pagination.jsx';
import { DateRangeFilters } from '../components/DateRangeFilters.jsx';
import { useAuth } from '../AuthContext.jsx';
import { PAGE_SIZE_OPTIONS } from '../utils/pagination.js';
import { normalizeAttendanceMe } from '../utils/api-data.js';

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
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
  const pending = user.approvalStatus === 'pending';
  const filtersActive = Boolean(from || to || search || type || liturgicalColor || status);

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
    if (pending) {
      setData(null);
      return undefined;
    }
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    if (search.trim()) params.set('search', search.trim());
    if (type) params.set('type', type);
    if (liturgicalColor) params.set('liturgicalColor', liturgicalColor);
    if (status) params.set('status', status);
    params.set('page', String(page));
    params.set('limit', String(pageSize));
    const query = params.toString();
    api(`/api/attendance/me?${query}`)
      .then((result) => {
        const normalized = normalizeAttendanceMe(result);
        setData(normalized);
        if (normalized.pagination.page && normalized.pagination.page !== page) {
          setPage(normalized.pagination.page);
        }
      })
      .catch((err) => setError(err.message));
    return undefined;
  }, [pending, from, to, search, type, liturgicalColor, status, page, pageSize]);

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
    applyRange('', '');
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
    <Shell
      links={[
        { to: '/attendance', label: 'My attendance', end: true },
        { to: '/account', label: 'Account' },
      ]}
    >
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
              <strong>{data.summary.rate}%</strong>
              <span>Attendance rate</span>
            </article>
            <article className="stat">
              <strong>{data.summary.present}</strong>
              <span>Present</span>
            </article>
            <article className="stat">
              <strong>{data.summary.late}</strong>
              <span>Late</span>
            </article>
            <article className="stat">
              <strong>{data.summary.absent}</strong>
              <span>Absent</span>
            </article>
          </div>

          <div className="card attendance-history-card">
            <h2>Your history</h2>

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
              from={from}
              to={to}
              filtersActive={filtersActive}
              onFromChange={handleFromChange}
              onToChange={handleToChange}
              onClear={clearFilters}
              onApplyRange={applyRange}
            />

            <p className="muted filter-summary">
              {data.pagination.total} of {data.meta?.totalUnfiltered ?? data.pagination.total} event
              {data.pagination.total === 1 ? '' : 's'} match
              {filtersActive ? ' these filters' : ''}
            </p>

            {data.pagination.total === 0 ? (
              <p className="muted">No events match these filters.</p>
            ) : (
              <>
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Event</th>
                      <th>Type</th>
                      <th>Liturgical color</th>
                      <th>Status</th>
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
                          <StatusBadge status={row.status} />
                        </td>
                        <td className="notes-cell">{row.notes || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

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
    </Shell>
  );
}

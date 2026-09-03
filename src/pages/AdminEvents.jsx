import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, EVENT_TYPES, LITURGICAL_COLORS, formatDate, formatEventType, toDateTimeLocal } from '../api.js';
import { LiturgicalColorBadge } from '../components/LiturgicalColorBadge.jsx';
import { ConfirmDialog } from '../components/ConfirmDialog.jsx';
import { Pagination } from '../components/Pagination.jsx';
import {
  emptyEventFilters,
  eventFiltersToParams,
  filtersAreActive,
} from '../utils/event-filters.js';
import { PAGE_SIZE_OPTIONS } from '../utils/pagination.js';

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

  const filtersActive = useMemo(() => filtersAreActive(filters), [filters]);

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

  async function loadEvents(nextPage = page, nextPageSize = pageSize, nextFilters = filters) {
    const params = eventFiltersToParams(nextFilters, { page: nextPage, pageSize: nextPageSize });
    const data = await api(`/api/events?${params}`);
    setEvents(data.events);
    setPagination(data.pagination);
    setTotalUnfiltered(data.meta.totalUnfiltered);
    if (data.pagination.page !== nextPage) {
      setPage(data.pagination.page);
    }
  }

  useEffect(() => {
    loadYears().catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loadEvents(page, pageSize, filters)
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, pageSize, filters]);

  function updateFilter(key, value) {
    if (key === 'search') {
      setSearchDraft(value);
      return;
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
    await Promise.all([loadEvents(page, pageSize, filters), loadYears()]);
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
          <p className="eyebrow">Admin</p>
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
        <h2>Upcoming and past</h2>

        <form className="form grid-form event-filters" onSubmit={(e) => e.preventDefault()}>
          <label className="span-2">
            Search
            <input
              type="search"
              value={searchDraft}
              onChange={(e) => updateFilter('search', e.target.value)}
              placeholder="Search title or notes"
            />
          </label>
          <label>
            Year
            <select value={filters.year} onChange={(e) => updateFilter('year', e.target.value)}>
              <option value="">All years</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </label>
          <label>
            Type
            <select value={filters.type} onChange={(e) => updateFilter('type', e.target.value)}>
              <option value="">All types</option>
              {EVENT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            From
            <input
              type="date"
              value={filters.from}
              onChange={(e) => updateFilter('from', e.target.value)}
            />
          </label>
          <label>
            To
            <input type="date" value={filters.to} onChange={(e) => updateFilter('to', e.target.value)} />
          </label>
          <label>
            Liturgical colour
            <select
              value={filters.liturgicalColor}
              onChange={(e) => updateFilter('liturgicalColor', e.target.value)}
            >
              <option value="">All colours</option>
              <option value="__none__">Not set</option>
              {LITURGICAL_COLORS.filter((color) => color.value).map((color) => (
                <option key={color.value} value={color.value}>
                  {color.label}
                </option>
              ))}
            </select>
          </label>
          <div className="row-actions span-2">
            <button type="button" className="ghost" onClick={clearFilters} disabled={!filtersActive}>
              Clear filters
            </button>
          </div>
        </form>

        <p className="muted filter-summary">
          {pagination.total} of {totalUnfiltered} event{totalUnfiltered === 1 ? '' : 's'} match
          {filtersActive ? ' these filters' : ''}
        </p>

        {loading ? (
          <p className="muted">Loading events…</p>
        ) : pagination.total === 0 ? (
          <p className="muted">No events match these filters.</p>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Colour</th>
                  <th className="actions-col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id} className={editingId === event.id ? 'editing' : ''}>
                    <td>{formatDate(event.date)}</td>
                    <td>{event.title}</td>
                    <td>{formatEventType(event.type)}</td>
                    <td>
                      <LiturgicalColorBadge color={event.liturgicalColor} />
                    </td>
                    <td className="table-actions-cell">
                      <div className="table-actions">
                        <Link to={`/admin/attendance/${event.id}`} className="table-action primary">
                          Take attendance
                        </Link>
                        <div className="table-actions-row">
                          <button type="button" className="ghost table-action" onClick={() => startEdit(event)}>
                            Edit
                          </button>
                          <button
                            type="button"
                            className="ghost danger table-action"
                            onClick={() => setDeleteId(event.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

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

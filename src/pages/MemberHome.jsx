import { useEffect, useState } from 'react';
import { api, formatDate, toDateInput } from '../api.js';
import { Shell } from '../components/Shell.jsx';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { useAuth } from '../AuthContext.jsx';

function daysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

function yearStart() {
  return new Date(new Date().getFullYear(), 0, 1);
}

export function MemberHome() {
  const { user, setUser } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [applied, setApplied] = useState({ from: '', to: '' });
  const pending = user.approvalStatus === 'pending';

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
    if (applied.from) params.set('from', applied.from);
    if (applied.to) params.set('to', applied.to);
    const query = params.toString();
    api(`/api/attendance/me${query ? `?${query}` : ''}`)
      .then(setData)
      .catch((err) => setError(err.message));
    return undefined;
  }, [pending, applied.from, applied.to]);

  function applyRange(nextFrom = from, nextTo = to) {
    setError('');
    setFrom(nextFrom);
    setTo(nextTo);
    setApplied({ from: nextFrom, to: nextTo });
  }

  function onFilter(event) {
    event.preventDefault();
    applyRange(from, to);
  }

  const filtered = Boolean(applied.from || applied.to);

  return (
    <Shell links={[{ to: '/', label: 'My attendance', end: true }]}>
      <section className="page-head">
        <div>
          <p className="eyebrow">Welcome back</p>
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
          <form className="card form grid-form" onSubmit={onFilter}>
            <h2 className="span-2">Filter by date</h2>
            <label>
              From
              <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </label>
            <label>
              To
              <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </label>
            <div className="row-actions span-2">
              <button type="submit">Apply</button>
              <button
                type="button"
                className="ghost"
                onClick={() => applyRange('', '')}
                disabled={!filtered && !from && !to}
              >
                Clear
              </button>
            </div>
            <div className="preset-row span-2">
              <button type="button" className="ghost" onClick={() => applyRange(toDateInput(daysAgo(30)), toDateInput(new Date()))}>
                Last 30 days
              </button>
              <button type="button" className="ghost" onClick={() => applyRange(toDateInput(daysAgo(90)), toDateInput(new Date()))}>
                Last 3 months
              </button>
              <button type="button" className="ghost" onClick={() => applyRange(toDateInput(yearStart()), toDateInput(new Date()))}>
                This year
              </button>
            </div>
          </form>

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

          <div className="card">
            <h2>Your history</h2>
            <p className="muted">
              {filtered
                ? `Showing ${data.history.length} event${data.history.length === 1 ? '' : 's'} from ${applied.from || 'the beginning'} to ${applied.to || 'today'}.`
                : 'Showing all recorded events. Choose dates above to narrow the list.'}
            </p>
            {data.history.length === 0 ? (
              <p className="muted">No events in this date range.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Event</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {data.history.map((row) => (
                    <tr key={row.event.id}>
                      <td>{formatDate(row.event.date)}</td>
                      <td>{row.event.title}</td>
                      <td className="capitalize">{row.event.type}</td>
                      <td>
                        <StatusBadge status={row.status} />
                      </td>
                      <td className="notes-cell">{row.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      ) : (
        <p className="muted">Loading your attendance…</p>
      )}
    </Shell>
  );
}

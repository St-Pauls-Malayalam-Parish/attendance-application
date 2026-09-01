import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, EVENT_TYPES, formatDate, toDateTimeLocal } from '../api.js';

export function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '',
    date: toDateTimeLocal(),
    type: 'rehearsal',
    notes: '',
  });
  const [busy, setBusy] = useState(false);

  async function load() {
    const data = await api('/api/events');
    setEvents(data.events);
  }

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, []);

  async function onSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api('/api/events', { method: 'POST', body: form });
      setForm({ title: '', date: toDateTimeLocal(), type: 'rehearsal', notes: '' });
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(id) {
    if (!window.confirm('Delete this event and its attendance records?')) return;
    await api(`/api/events/${id}`, { method: 'DELETE' });
    await load();
  }

  return (
    <>
      <section className="page-head">
        <div>
          <p className="eyebrow">Admin</p>
          <h1>Rehearsals and services</h1>
          <p className="lede">Create events, then mark who was present from Take attendance.</p>
        </div>
      </section>

      {error ? <p className="alert">{error}</p> : null}

      <form className="card form grid-form" onSubmit={onSubmit}>
        <label>
          Title
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Friday rehearsal"
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
        <label className="span-2">
          Notes
          <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </label>
        <button type="submit" disabled={busy}>
          {busy ? 'Saving…' : 'Add event'}
        </button>
      </form>

      <div className="card">
        <h2>Upcoming and past</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Title</th>
              <th>Type</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id}>
                <td>{formatDate(event.date)}</td>
                <td>{event.title}</td>
                <td className="capitalize">{event.type}</td>
                <td className="row-actions">
                  <Link to={`/admin/attendance/${event.id}`}>Take attendance</Link>
                  <button type="button" className="ghost danger" onClick={() => remove(event.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

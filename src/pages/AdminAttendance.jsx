import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, formatDate } from '../api.js';

const STATUSES = [
  { value: 'present', label: 'Present' },
  { value: 'late', label: 'Late' },
  { value: 'absent', label: 'Absent' },
  { value: 'excused', label: 'Excused' },
];

export function AdminAttendance() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [roster, setRoster] = useState([]);
  const [event, setEvent] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState('');

  useEffect(() => {
    api('/api/events')
      .then((data) => setEvents(data.events))
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    if (!eventId) {
      setRoster([]);
      setEvent(null);
      return;
    }
    setSaved('');
    api(`/api/attendance/event/${eventId}`)
      .then((data) => {
        setEvent(data.event);
        setRoster(data.roster);
      })
      .catch((err) => setError(err.message));
  }, [eventId]);

  function updateRow(memberId, patch) {
    setRoster((current) =>
      current.map((row) => (row.id === memberId ? { ...row, ...patch } : row))
    );
  }

  async function save() {
    setBusy(true);
    setError('');
    setSaved('');
    try {
      const records = roster
        .filter((row) => row.status)
        .map((row) => ({
          userId: row.id,
          status: row.status,
          notes: row.notes || '',
        }));
      await api(`/api/attendance/event/${eventId}`, { method: 'PUT', body: { records } });
      setSaved('Attendance saved');
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
          <h1>Take attendance</h1>
          <p className="lede">
            Mark each singer and add a short note if needed (for example, arrived late or excused
            for travel).
          </p>
        </div>
      </section>

      {error ? <p className="alert">{error}</p> : null}

      <label className="card picker">
        Choose an event
        <select
          value={eventId || ''}
          onChange={(e) => navigate(e.target.value ? `/admin/attendance/${e.target.value}` : '/admin/attendance')}
        >
          <option value="">Select a rehearsal or service</option>
          {events.map((item) => (
            <option key={item.id} value={item.id}>
              {formatDate(item.date)} — {item.title}
            </option>
          ))}
        </select>
      </label>

      {event ? (
        <div className="card attendance-card">
          <div className="toolbar">
            <div>
              <h2>{event.title}</h2>
              <p className="muted">
                {formatDate(event.date)} · {event.type}
              </p>
            </div>
            <button type="button" onClick={save} disabled={busy}>
              {busy ? 'Saving…' : 'Save attendance'}
            </button>
          </div>
          {saved ? <p className="ok">{saved}</p> : null}
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Voice</th>
                <th>Status</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {roster.map((member) => (
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
        </div>
      ) : (
        <p className="muted">Pick an event to mark the choir.</p>
      )}
    </>
  );
}

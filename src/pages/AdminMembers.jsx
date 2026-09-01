import { useEffect, useState } from 'react';
import { api, VOICE_PARTS } from '../api.js';

const emptyForm = {
  name: '',
  email: '',
  password: '',
  voicePart: 'other',
};

export function AdminMembers() {
  const [pending, setPending] = useState([]);
  const [members, setMembers] = useState([]);
  const [declined, setDeclined] = useState([]);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    const data = await api('/api/members');
    setPending(data.pending);
    setMembers(data.members);
    setDeclined(data.declined);
  }

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, []);

  function startEdit(member) {
    setError('');
    setSaved('');
    setEditingId(member.id);
    setForm({
      name: member.name,
      email: member.email,
      password: '',
      voicePart: member.voicePart || 'other',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function onSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setSaved('');
    try {
      if (editingId) {
        const body = {
          name: form.name,
          email: form.email,
          voicePart: form.voicePart,
        };
        if (form.password) {
          body.password = form.password;
        }
        await api(`/api/members/${editingId}`, { method: 'PATCH', body });
        setSaved('Member details saved');
        cancelEdit();
      } else {
        await api('/api/members', { method: 'POST', body: form });
        setForm(emptyForm);
        setSaved('Member added');
      }
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function setApproval(id, approvalStatus) {
    setError('');
    try {
      await api(`/api/members/${id}/approval`, {
        method: 'PATCH',
        body: { approvalStatus },
      });
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <>
      <section className="page-head">
        <div>
          <p className="eyebrow">Admin</p>
          <h1>Choir members</h1>
          <p className="lede">
            New sign-ups wait here until you approve them. Use Edit on the roster to change a
            singer’s name, email, voice part, or password.
          </p>
        </div>
      </section>

      {error ? <p className="alert">{error}</p> : null}
      {saved ? <p className="ok">{saved}</p> : null}

      <div className="card">
        <h2>Waiting for approval {pending.length ? `(${pending.length})` : ''}</h2>
        {pending.length === 0 ? (
          <p className="muted">No pending registrations.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Voice</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pending.map((member) => (
                <tr key={member.id}>
                  <td>{member.name}</td>
                  <td>{member.email}</td>
                  <td className="capitalize">{member.voicePart}</td>
                  <td className="row-actions">
                    <button type="button" className="ghost" onClick={() => startEdit(member)}>
                      Edit
                    </button>
                    <button type="button" onClick={() => setApproval(member.id, 'approved')}>
                      Approve
                    </button>
                    <button
                      type="button"
                      className="ghost danger"
                      onClick={() => setApproval(member.id, 'rejected')}
                    >
                      Decline
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <form className="card form grid-form" onSubmit={onSubmit}>
        <h2 className="span-2">{editingId ? 'Edit member' : 'Add approved member'}</h2>
        <label>
          Name
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </label>
        <label>
          Email
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </label>
        <label>
          {editingId ? 'New password (optional)' : 'Temporary password'}
          <input
            type="text"
            minLength={editingId ? undefined : 8}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required={!editingId}
            placeholder={editingId ? 'Leave blank to keep current password' : ''}
          />
        </label>
        <label>
          Voice part
          <select value={form.voicePart} onChange={(e) => setForm({ ...form, voicePart: e.target.value })}>
            {VOICE_PARTS.map((part) => (
              <option key={part.value} value={part.value}>
                {part.label}
              </option>
            ))}
          </select>
        </label>
        <div className="row-actions span-2">
          {editingId ? (
            <button type="button" className="ghost" onClick={cancelEdit}>
              Cancel
            </button>
          ) : null}
          <button type="submit" disabled={busy}>
            {busy ? 'Saving…' : editingId ? 'Save changes' : 'Add approved member'}
          </button>
        </div>
      </form>

      <div className="card">
        <h2>Roster</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Voice</th>
              <th>Rate</th>
              <th>Present</th>
              <th>Absent</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id} className={editingId === member.id ? 'editing' : ''}>
                <td>{member.name}</td>
                <td>{member.email}</td>
                <td className="capitalize">{member.voicePart}</td>
                <td>{member.summary.rate}%</td>
                <td>{member.summary.present}</td>
                <td>{member.summary.absent}</td>
                <td className="row-actions">
                  <button type="button" className="ghost" onClick={() => startEdit(member)}>
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {declined.length > 0 ? (
        <div className="card">
          <h2>Declined</h2>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {declined.map((member) => (
                <tr key={member.id}>
                  <td>{member.name}</td>
                  <td>{member.email}</td>
                  <td className="row-actions">
                    <button type="button" className="ghost" onClick={() => startEdit(member)}>
                      Edit
                    </button>
                    <button type="button" className="ghost" onClick={() => setApproval(member.id, 'approved')}>
                      Approve anyway
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </>
  );
}

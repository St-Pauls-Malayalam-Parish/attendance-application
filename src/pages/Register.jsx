import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { api, VOICE_PARTS } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import { AuthLayout } from '../components/AuthLayout.jsx';

export function Register() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    voicePart: 'other',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/'} replace />;
  }

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const data = await api('/api/auth/register', { method: 'POST', body: form });
      setUser(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout title="Create account">
      <form onSubmit={onSubmit} className="card form auth-form">
        <p className="auth-form-intro">
          Register now. A choir admin will approve your account before you appear on the roster.
        </p>
        {error ? <p className="alert">{error}</p> : null}
        <label>
          Full name
          <input value={form.name} onChange={(e) => update('name', e.target.value)} required />
        </label>
        <label>
          Username
          <input
            type="text"
            autoComplete="username"
            minLength={3}
            value={form.username}
            onChange={(e) => update('username', e.target.value.toLowerCase())}
            placeholder="e.g. firstname.lastname"
            required
          />
        </label>
        <label>
          Email
          <input
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            autoComplete="new-password"
            minLength={8}
            value={form.password}
            onChange={(e) => update('password', e.target.value)}
            required
          />
        </label>
        <label>
          Voice part
          <select value={form.voicePart} onChange={(e) => update('voicePart', e.target.value)}>
            {VOICE_PARTS.map((part) => (
              <option key={part.value} value={part.value}>
                {part.label}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="auth-submit" disabled={busy}>
          {busy ? 'Creating…' : 'Create account'}
        </button>
      </form>
      <p className="auth-footer muted">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </AuthLayout>
  );
}

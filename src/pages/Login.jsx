import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import { AuthLayout } from '../components/AuthLayout.jsx';

export function Login() {
  const { user, setUser } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/'} replace />;
  }

  async function onSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const data = await api('/api/auth/login', { method: 'POST', body: { username, password } });
      setUser(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout
      title="Sign in to see your attendance"
      lede="Each singer can view only their own record after a choir admin approves the account."
    >
      <form onSubmit={onSubmit} className="card form">
        {error ? <p className="alert">{error}</p> : null}
        <label>
          Username
          <input
            type="text"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <button type="submit" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
        <p className="muted">
          New to the choir? <Link to="/register">Create an account</Link>
        </p>
      </form>
    </AuthLayout>
  );
}

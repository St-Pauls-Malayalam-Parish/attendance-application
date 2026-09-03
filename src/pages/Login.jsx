import { useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import { AuthLayout } from '../components/AuthLayout.jsx';

export function Login() {
  const { user, setUser } = useAuth();
  const [searchParams] = useSearchParams();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const sessionExpired = searchParams.get('session') === 'expired';

  if (user) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/'} replace />;
  }

  async function onSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const data = await api('/api/auth/login', {
        method: 'POST',
        body: { username, password },
        skipAuthRedirect: true,
      });
      setUser(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout title="Sign in">
      <form onSubmit={onSubmit} className="card form auth-form">
        <p className="auth-form-intro">
          Use your parish username. Each singer sees only their own attendance after a choir admin
          approves the account.
        </p>
        {sessionExpired ? (
          <p className="alert">Your session expired. Please sign in again.</p>
        ) : null}
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
        <button type="submit" className="auth-submit" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p className="auth-footer muted">
        New to the choir? <Link to="/register">Create an account</Link>
      </p>
    </AuthLayout>
  );
}

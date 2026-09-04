import { Navigate } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout.jsx';
import { ChangePasswordForm } from '../components/ChangePasswordForm.jsx';
import { useAuth } from '../AuthContext.jsx';

export function ChangePassword() {
  const { user, loading, setUser, logout } = useAuth();

  if (loading) {
    return <div className="page-center muted">Loading…</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!user.mustChangePassword) {
    return <Navigate to={user.role === 'admin' ? '/admin/events' : '/attendance'} replace />;
  }

  function onSuccess(updatedUser) {
    setUser(updatedUser);
  }

  return (
    <AuthLayout title="Set your password">
      <ChangePasswordForm required onSuccess={onSuccess} />
      <p className="auth-footer muted">
        <button type="button" className="ghost" onClick={logout}>
          Sign out
        </button>
      </p>
    </AuthLayout>
  );
}

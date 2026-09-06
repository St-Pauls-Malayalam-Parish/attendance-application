import { Navigate } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout.jsx';
import { ChangePasswordForm } from '../components/ChangePasswordForm.jsx';
import { ConfirmDialog } from '../components/ConfirmDialog.jsx';
import { useAuth } from '../AuthContext.jsx';
import { useConfirmDialog } from '../hooks/useConfirmDialog.js';

export function ChangePassword() {
  const { user, loading, setUser, logout } = useAuth();
  const { confirm, confirmProps } = useConfirmDialog();

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

  function requestSignOut() {
    confirm({
      title: 'Sign out?',
      description: 'You can sign in again after setting your password.',
      confirmLabel: 'Sign out',
      cancelLabel: 'Stay signed in',
      tone: 'default',
      action: logout,
    });
  }

  return (
    <AuthLayout title="Set your password">
      <ChangePasswordForm required onSuccess={onSuccess} />
      <p className="auth-footer muted">
        <button type="button" className="ghost" onClick={requestSignOut}>
          Sign out
        </button>
      </p>
      <ConfirmDialog {...confirmProps} />
    </AuthLayout>
  );
}

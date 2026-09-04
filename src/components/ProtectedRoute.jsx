import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';

export function ProtectedRoute({ adminOnly = false }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="page-center muted">Loading…</div>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (user.mustChangePassword) {
    return <Navigate to="/change-password" replace />;
  }
  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/attendance" replace />;
  }
  if (!adminOnly && user.role === 'admin') {
    return <Navigate to="/admin/events" replace />;
  }
  return <Outlet />;
}

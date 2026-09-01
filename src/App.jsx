import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import { Login } from './pages/Login.jsx';
import { Register } from './pages/Register.jsx';
import { MemberHome } from './pages/MemberHome.jsx';
import { AdminHome } from './pages/AdminHome.jsx';
import { AdminEvents } from './pages/AdminEvents.jsx';
import { AdminAttendance } from './pages/AdminAttendance.jsx';
import { AdminMembers } from './pages/AdminMembers.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<MemberHome />} />
      </Route>
      <Route element={<ProtectedRoute adminOnly />}>
        <Route path="/admin" element={<AdminHome />}>
          <Route index element={<AdminEvents />} />
          <Route path="attendance" element={<AdminAttendance />} />
          <Route path="attendance/:eventId" element={<AdminAttendance />} />
          <Route path="members" element={<AdminMembers />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

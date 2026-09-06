import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import { Login } from './pages/Login.jsx';
import { Register } from './pages/Register.jsx';
import { MemberHome } from './pages/MemberHome.jsx';
import { MemberProfile } from './pages/MemberProfile.jsx';
import { AdminHome } from './pages/AdminHome.jsx';
import { AdminEvents } from './pages/AdminEvents.jsx';
import { AdminAttendance } from './pages/AdminAttendance.jsx';
import { AdminMembers } from './pages/AdminMembers.jsx';
import { AdminMemberProfile } from './pages/AdminMemberProfile.jsx';
import { Account } from './pages/Account.jsx';
import { ChangePassword } from './pages/ChangePassword.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/change-password" element={<ChangePassword />} />
      <Route element={<ProtectedRoute />}>
        <Route index element={<Navigate to="attendance" replace />} />
        <Route path="attendance" element={<MemberHome />} />
        <Route path="my-profile" element={<MemberProfile />} />
        <Route path="account" element={<Account />} />
      </Route>
      <Route element={<ProtectedRoute adminOnly />}>
        <Route path="/admin" element={<AdminHome />}>
          <Route index element={<Navigate to="events" replace />} />
          <Route path="events" element={<AdminEvents />} />
          <Route path="attendance" element={<AdminAttendance />} />
          <Route path="attendance/:eventId" element={<AdminAttendance />} />
          <Route path="members" element={<AdminMembers />} />
          <Route path="members/:memberId/profile" element={<AdminMemberProfile />} />
          <Route path="account" element={<Account admin />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/attendance" replace />} />
    </Routes>
  );
}

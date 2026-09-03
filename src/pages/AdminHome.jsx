import { Outlet } from 'react-router-dom';
import { Shell } from '../components/Shell.jsx';

export function AdminHome() {
  return (
    <Shell
      links={[
        { to: '/admin/events', label: 'Events', end: true },
        { to: '/admin/attendance', label: 'Take attendance' },
        { to: '/admin/members', label: 'Members' },
        { to: '/admin/account', label: 'Account' },
      ]}
    >
      <Outlet />
    </Shell>
  );
}

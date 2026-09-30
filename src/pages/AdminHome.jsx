import { Outlet } from 'react-router-dom';
import { Shell } from '../components/Shell.jsx';

export function AdminHome() {
  return (
    <Shell
      links={[
        { to: '/admin/events', label: 'Events', mobileLabel: 'Events', end: true },
        { to: '/admin/attendance', label: 'Take attendance', mobileLabel: 'Attendance' },
        { to: '/admin/members', label: 'Members', mobileLabel: 'Members' },
        { to: '/admin/faqs', label: 'FAQs', mobileLabel: 'FAQs' },
        { to: '/admin/account', label: 'Account', mobileLabel: 'Account' },
      ]}
    >
      <Outlet />
    </Shell>
  );
}

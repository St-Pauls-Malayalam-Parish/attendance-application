import { Outlet } from 'react-router-dom';
import { Shell } from '../components/Shell.jsx';
import { memberLinks } from '../nav/memberLinks.js';

export function MemberLayout() {
  return (
    <Shell links={memberLinks}>
      <Outlet />
    </Shell>
  );
}

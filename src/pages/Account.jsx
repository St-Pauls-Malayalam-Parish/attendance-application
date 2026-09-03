import { Shell } from '../components/Shell.jsx';
import { ChangePasswordForm } from '../components/ChangePasswordForm.jsx';
import { useAuth } from '../AuthContext.jsx';

const memberLinks = [
  { to: '/', label: 'My attendance', end: true },
  { to: '/account', label: 'Account' },
];

const adminLinks = [
  { to: '/admin', label: 'Events', end: true },
  { to: '/admin/attendance', label: 'Take attendance' },
  { to: '/admin/members', label: 'Members' },
  { to: '/admin/account', label: 'Account' },
];

export function Account({ admin = false }) {
  const { user } = useAuth();

  return (
    <Shell links={admin ? adminLinks : memberLinks}>
      <section className="page-head">
        <div>
          <p className="eyebrow">Account</p>
          <h1>{user.name}</h1>
          <p className="lede">
            Signed in as <strong>{user.username}</strong>
            {admin ? ' (choir admin)' : ''}.
          </p>
        </div>
      </section>
      <ChangePasswordForm />
    </Shell>
  );
}

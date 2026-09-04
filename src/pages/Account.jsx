import { Shell } from '../components/Shell.jsx';
import { ChangePasswordForm } from '../components/ChangePasswordForm.jsx';
import { useAuth } from '../AuthContext.jsx';

const memberLinks = [
  { to: '/attendance', label: 'My attendance', end: true },
  { to: '/account', label: 'Account' },
];

export function Account({ admin = false }) {
  const { user, setUser } = useAuth();

  const content = (
    <>
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
      <ChangePasswordForm onSuccess={setUser} />
    </>
  );

  if (admin) {
    return content;
  }

  return <Shell links={memberLinks}>{content}</Shell>;
}

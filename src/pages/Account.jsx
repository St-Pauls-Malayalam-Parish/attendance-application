import { AccountSettingsForm } from '../components/AccountSettingsForm.jsx';
import { useAuth } from '../AuthContext.jsx';
import { emailNeedsUpdate } from '../utils/email.js';

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
            {user.email ? (
              <>
                {' '}
                · <span className={emailNeedsUpdate(user) ? 'account-email-warning' : undefined}>{user.email}</span>
              </>
            ) : null}
            {admin ? ' (choir admin)' : ''}.
          </p>
        </div>
      </section>
      <AccountSettingsForm user={user} onSuccess={setUser} />
    </>
  );

  if (admin) {
    return content;
  }

  return content;
}

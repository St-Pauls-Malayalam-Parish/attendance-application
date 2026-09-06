import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { Shell } from '../components/Shell.jsx';
import { MemberProfileDisplay } from '../components/MemberProfileDisplay.jsx';
import { useAuth } from '../AuthContext.jsx';

const memberLinks = [
  { to: '/attendance', label: 'My attendance', end: true },
  { to: '/my-profile', label: 'My profile' },
  { to: '/account', label: 'Account' },
];

export function MemberProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const pending = user.approvalStatus === 'pending';

  useEffect(() => {
    if (pending) {
      setProfile(null);
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    api('/api/auth/my-profile')
      .then((data) => {
        if (!cancelled) setProfile(data.profile);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [pending]);

  return (
    <Shell links={memberLinks}>
      <section className="page-head">
        <div>
          <p className="eyebrow">My profile</p>
          <h1>{user.name}</h1>
          <p className="lede">
            Your voice range, choir pathway, and feedback from the choir team.
          </p>
        </div>
      </section>

      {pending ? (
        <section className="card">
          <h2>Waiting for approval</h2>
          <p className="lede">
            Your choir profile will appear here after an admin approves your account.
          </p>
        </section>
      ) : null}

      {error ? <p className="alert">{error}</p> : null}

      {loading && !pending ? <p className="muted">Loading your profile…</p> : null}

      {!pending && !loading && profile ? (
        <MemberProfileDisplay profile={profile} voicePart={user.voicePart} />
      ) : null}
    </Shell>
  );
}

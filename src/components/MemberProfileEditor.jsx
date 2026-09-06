import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { ProfileHistoryPanel } from './ProfileHistoryPanel.jsx';

export function MemberProfileEditor({ memberId, onMemberLoaded }) {
  const [profile, setProfile] = useState(null);
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!memberId) {
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    setError('');

    api(`/api/members/${memberId}/profile`)
      .then((data) => {
        if (cancelled) return;
        setProfile(data.profile);
        setMember(data.member);
        onMemberLoaded?.(data.member);
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
  }, [memberId]);

  if (loading) {
    return <p className="muted">Loading history…</p>;
  }

  if (error) {
    return <p className="alert">{error}</p>;
  }

  return (
    <div className="member-profile-editor">
      {member ? (
        <p className="muted member-profile-context">
          {member.name}
          {member.voicePart ? (
            <>
              {' '}
              · <span className="capitalize">{member.voicePart}</span>
            </>
          ) : null}
        </p>
      ) : null}

      <section className="card member-profile-history-card">
        <h2>History</h2>
        <p className="muted">Past voice range updates, feedback, and pathway changes.</p>
        <ProfileHistoryPanel profile={profile} />
      </section>
    </div>
  );
}

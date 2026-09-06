import { useEffect, useState } from 'react';
import { api, CHOIR_PATHWAYS } from '../api.js';
import { ProfileSummary } from './ProfileHistoryPanel.jsx';

const emptyForm = {
  voiceRange: '',
  feedback: '',
  choirPathway: '',
};

export function MemberProfileForm({
  memberId,
  onSaved,
  onMemberLoaded,
  onClose,
  busy: externalBusy,
  setBusy: setExternalBusy,
}) {
  const [profile, setProfile] = useState(null);
  const [member, setMember] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [internalBusy, setInternalBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState('');

  const busy = externalBusy ?? internalBusy;
  const setBusy = setExternalBusy ?? setInternalBusy;

  useEffect(() => {
    if (!memberId) {
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    setError('');
    setSaved('');
    setForm(emptyForm);

    api(`/api/members/${memberId}/profile`)
      .then((data) => {
        if (cancelled) return;
        setProfile(data.profile);
        setMember(data.member);
        onMemberLoaded?.(data.member);
        setForm({
          voiceRange: data.profile.voiceRange || '',
          feedback: '',
          choirPathway: data.profile.choirPathway || '',
        });
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

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
    setSaved('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setSaved('');

    const payload = {};
    const nextVoiceRange = form.voiceRange.trim();
    const nextFeedback = form.feedback.trim();

    if (nextVoiceRange && nextVoiceRange !== (profile?.voiceRange || '')) {
      payload.voiceRange = nextVoiceRange;
    }
    if (nextFeedback) {
      payload.feedback = nextFeedback;
    }
    if (form.choirPathway && form.choirPathway !== (profile?.choirPathway || '')) {
      payload.choirPathway = form.choirPathway;
    }

    if (!Object.keys(payload).length) {
      setError('Update voice range, add feedback, or change the choir pathway.');
      setBusy(false);
      return;
    }

    try {
      const data = await api(`/api/members/${memberId}/profile`, {
        method: 'PATCH',
        body: payload,
      });
      setProfile(data.profile);
      setForm({
        voiceRange: data.profile.voiceRange || '',
        feedback: '',
        choirPathway: data.profile.choirPathway || '',
      });
      setSaved('Saved. The member can see this on My profile.');
      onSaved?.(data.profile);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <p className="muted profile-loading">Loading feedback profile…</p>;
  }

  return (
    <>
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

      {error ? <p className="alert">{error}</p> : null}
      {saved ? <p className="ok">{saved}</p> : null}

      <div className="member-profile-current">
        <h2>Current</h2>
        <ProfileSummary profile={profile} />
      </div>

      <form className="form grid-form event-form member-profile-form" onSubmit={handleSubmit}>
        <h2 className="span-2 member-profile-form-title">Update</h2>

        <label>
          Voice range
          <input
            value={form.voiceRange}
            onChange={(e) => updateField('voiceRange', e.target.value)}
            placeholder="e.g. Tenor: C3–B4"
            maxLength={200}
          />
          <span className="field-hint">Saved to history when the range changes.</span>
        </label>

        <label>
          Choir pathway
          <select
            value={form.choirPathway}
            onChange={(e) => updateField('choirPathway', e.target.value)}
          >
            <option value="">Not set</option>
            {CHOIR_PATHWAYS.map((pathway) => (
              <option key={pathway.value} value={pathway.value}>
                {pathway.label}
              </option>
            ))}
          </select>
          <span className="field-hint">Saved to history when the pathway changes.</span>
        </label>

        <label className="span-2">
          Add feedback
          <textarea
            value={form.feedback}
            onChange={(e) => updateField('feedback', e.target.value)}
            rows={5}
            placeholder="Progress notes, strengths, or next steps for this member"
            maxLength={2000}
          />
          <span className="field-hint">Each save adds a new entry. Previous feedback is kept.</span>
        </label>

        <div className="event-form-actions span-2">
          <div className="row-actions event-form-submit-row">
            {onClose ? (
              <button type="button" className="ghost" onClick={onClose} disabled={busy}>
                Cancel
              </button>
            ) : null}
            <button type="submit" disabled={busy}>
              {busy ? 'Saving…' : 'Save for member'}
            </button>
          </div>
        </div>
      </form>
    </>
  );
}

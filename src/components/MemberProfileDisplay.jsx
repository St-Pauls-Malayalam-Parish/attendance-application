import { ProfileHistoryPanel, ProfileSummary } from './ProfileHistoryPanel.jsx';
import { formatProfileHistoryDate, formatProfileHistoryTime, formatVoicePart } from '../api.js';

export function MemberProfileDisplay({ profile, voicePart }) {
  const latestFeedback = profile.feedbackHistory?.[0] ?? null;
  const voicePartLabel = formatVoicePart(voicePart);

  return (
    <div className="member-profile-view">
      <section className="card member-profile-current-card">
        <div className="member-profile-current">
          <div className="member-profile-current-head">
            <h2>Current</h2>
            {voicePartLabel ? <span className="profile-voice-badge">{voicePartLabel}</span> : null}
          </div>
          <ProfileSummary profile={profile} />
        </div>

        {latestFeedback ? (
          <div className="member-profile-latest-feedback">
            <h3>Latest feedback</h3>
            <blockquote className="profile-history-feedback">{latestFeedback.text}</blockquote>
            <time className="profile-history-latest-date" dateTime={latestFeedback.recordedAt}>
              {formatProfileHistoryDate(latestFeedback.recordedAt)} ·{' '}
              {formatProfileHistoryTime(latestFeedback.recordedAt)}
            </time>
          </div>
        ) : null}
      </section>

      <section className="card member-profile-history-card">
        <h2>History</h2>
        <p className="muted">Past voice range updates, feedback, and pathway changes.</p>
        <ProfileHistoryPanel profile={profile} />
      </section>
    </div>
  );
}

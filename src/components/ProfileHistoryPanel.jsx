import {
  formatChoirPathway,
  formatProfileHistoryDate,
  formatProfileHistoryTime,
} from '../api.js';

function historyDayKey(recordedAt) {
  const date = new Date(recordedAt);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function buildHistoryGroups(profile) {
  const entries = [
    ...profile.voiceRangeHistory.map((item) => ({
      id: item.id,
      recordedAt: item.recordedAt,
      type: 'Voice range',
      value: item.value,
      isFeedback: false,
    })),
    ...profile.feedbackHistory.map((item) => ({
      id: item.id,
      recordedAt: item.recordedAt,
      type: 'Feedback',
      value: item.text,
      isFeedback: true,
    })),
    ...profile.pathwayHistory.map((item) => ({
      id: item.id,
      recordedAt: item.recordedAt,
      type: 'Choir pathway',
      value: formatChoirPathway(item.pathway),
      isFeedback: false,
    })),
  ].sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime());

  const groups = [];

  for (const entry of entries) {
    const key = historyDayKey(entry.recordedAt);
    const lastGroup = groups[groups.length - 1];

    if (lastGroup?.key === key) {
      lastGroup.items.push(entry);
      continue;
    }

    groups.push({
      key,
      recordedAt: entry.recordedAt,
      items: [entry],
    });
  }

  return groups;
}

export function ProfileHistoryPanel({ profile }) {
  if (!profile) {
    return null;
  }

  const groups = buildHistoryGroups(profile);

  if (groups.length === 0) {
    return <p className="profile-history-empty">No updates recorded yet.</p>;
  }

  return (
    <div className="profile-history-table-wrap">
      <table className="data-table profile-history-table">
        <thead>
          <tr>
            <th className="col-date">Date</th>
            <th className="col-update">Update</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((group) =>
            group.items.map((item, index) => (
              <tr key={item.id}>
                {index === 0 ? (
                  <td className="col-date" rowSpan={group.items.length}>
                    <time className="profile-history-datecell" dateTime={group.recordedAt}>
                      <span className="profile-history-date">{formatProfileHistoryDate(group.recordedAt)}</span>
                    </time>
                  </td>
                ) : null}
                <td className="col-update">
                  <div className="profile-history-update-head">
                    <span className="profile-history-time">{formatProfileHistoryTime(item.recordedAt)}</span>
                    <span className="profile-history-type">{item.type}</span>
                  </div>
                  {item.isFeedback ? (
                    <p className="profile-history-feedback">{item.value}</p>
                  ) : (
                    <p className="profile-history-value">{item.value}</p>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export function ProfileSummary({ profile }) {
  if (!profile) {
    return null;
  }

  return (
    <dl className="profile-summary">
      <div>
        <dt>Voice range</dt>
        <dd>{profile.voiceRange || 'Not set'}</dd>
      </div>
      <div>
        <dt>Choir pathway</dt>
        <dd>{formatChoirPathway(profile.choirPathway)}</dd>
      </div>
    </dl>
  );
}

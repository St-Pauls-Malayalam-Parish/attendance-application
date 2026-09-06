import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, VOICE_PARTS, toDateInput, formatChoirPathway } from '../api.js';
import { ConfirmDialog } from '../components/ConfirmDialog.jsx';
import { StatusMessage } from '../components/StatusMessage.jsx';
import { useConfirmDialog } from '../hooks/useConfirmDialog.js';
import { FilterPanel } from '../components/FilterPanel.jsx';
import { MemberCard } from '../components/MemberCard.jsx';
import { MemberFormModal } from '../components/MemberFormModal.jsx';
import { MemberProfileModal } from '../components/MemberProfileModal.jsx';
import { MemberTableActions } from '../components/MemberTableActions.jsx';
import { Pagination } from '../components/Pagination.jsx';
import {
  emptyMemberFilters,
  memberFiltersAreActive,
  memberFiltersToParams,
} from '../utils/member-filters.js';
import { validatePassword } from '../utils/password.js';
import { PAGE_SIZE_OPTIONS } from '../utils/pagination.js';
import { normalizeMembersLists, normalizeRosterList } from '../utils/api-data.js';

const emptyForm = {
  name: '',
  username: '',
  email: '',
  password: '',
  voicePart: '',
};

const emptyPagination = () => ({
  page: 1,
  pageSize: 10,
  total: 0,
  totalPages: 1,
  rangeStart: 0,
  rangeEnd: 0,
  hasPrevious: false,
  hasNext: false,
});

function daysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

function yearStart() {
  return new Date(new Date().getFullYear(), 0, 1);
}

export function AdminMembers() {
  const [pending, setPending] = useState([]);
  const [members, setMembers] = useState([]);
  const [inactive, setInactive] = useState([]);
  const [declined, setDeclined] = useState([]);
  const [pagination, setPagination] = useState(emptyPagination);
  const [totalUnfiltered, setTotalUnfiltered] = useState(0);
  const [attendanceMeta, setAttendanceMeta] = useState({ dateFiltered: false, from: '', to: '' });
  const [filters, setFilters] = useState(emptyMemberFilters);
  const [searchDraft, setSearchDraft] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
  const [loadingRoster, setLoadingRoster] = useState(true);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [profileMember, setProfileMember] = useState(null);
  const { confirm, confirmProps } = useConfirmDialog({
    onError: (err) => setError(err.message),
  });

  const filtersActive = useMemo(() => memberFiltersAreActive(filters), [filters]);
  const activeFilterCount = useMemo(
    () => Object.values(filters).filter(Boolean).length,
    [filters]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((current) => ({ ...current, search: searchDraft }));
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchDraft]);

  async function loadLists() {
    const data = await api('/api/members');
    const normalized = normalizeMembersLists(data);
    setPending(normalized.pending);
    setInactive(normalized.inactive);
    setDeclined(normalized.declined);
  }

  async function loadRoster(nextPage = page, nextPageSize = pageSize, nextFilters = filters) {
    const params = memberFiltersToParams(nextFilters, { page: nextPage, pageSize: nextPageSize });
    const data = await api(`/api/members/roster?${params}`);
    const normalized = normalizeRosterList(data, nextPageSize);
    setMembers(normalized.members);
    setPagination(normalized.pagination);
    setTotalUnfiltered(normalized.totalUnfiltered);
    setAttendanceMeta(normalized.attendanceMeta);
    if (normalized.pagination.page !== nextPage) {
      setPage(normalized.pagination.page);
    }
  }

  async function refreshAll() {
    await Promise.all([loadLists(), loadRoster()]);
  }

  useEffect(() => {
    loadLists().catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoadingRoster(true);
    loadRoster(page, pageSize, filters)
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoadingRoster(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, pageSize, filters]);

  function updateFilter(key, value) {
    if (key === 'search') {
      setSearchDraft(value);
      return;
    }
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  }

  function clearFilters() {
    setSearchDraft('');
    setFilters(emptyMemberFilters());
    setPage(1);
  }

  function handlePageSizeChange(nextPageSize) {
    setPageSize(nextPageSize);
    setPage(1);
  }

  function openAddMember() {
    setError('');
    setSaved('');
    setEditingId(null);
    setForm(emptyForm);
    setMemberModalOpen(true);
  }

  function closeMemberModal() {
    if (busy) return;
    setMemberModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  function startEdit(member) {
    setError('');
    setSaved('');
    setEditingId(member.id);
    setForm({
      name: member.name,
      username: member.username,
      email: member.email,
      password: '',
      voicePart: member.voicePart === 'other' ? '' : member.voicePart || '',
    });
    setMemberModalOpen(true);
  }

  function cancelEdit() {
    closeMemberModal();
  }

  function startProfile(member) {
    setError('');
    setSaved('');
    setProfileMember(member);
  }

  function closeProfileModal() {
    setProfileMember(null);
  }

  async function handleProfileSaved() {
    setSaved('Member feedback saved');
    await refreshAll();
  }

  async function onSubmit() {
    const passwordError = validatePassword(form.password, { required: !editingId });
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setBusy(true);
    setError('');
    setSaved('');
    try {
      if (editingId) {
        const body = {
          name: form.name,
          username: form.username,
          email: form.email,
          voicePart: form.voicePart,
        };
        if (form.password) {
          body.password = form.password;
        }
        await api(`/api/members/${editingId}`, { method: 'PATCH', body });
        setSaved('Member details saved');
      } else {
        await api('/api/members', { method: 'POST', body: form });
        setSaved('Member added');
      }
      closeMemberModal();
      await refreshAll();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function requestApproval(member, approvalStatus) {
    setError('');
    setSaved('');
    const isApprove = approvalStatus === 'approved';

    confirm({
      title: isApprove ? `Approve ${member.name}?` : `Decline ${member.name}?`,
      description: isApprove
        ? 'They can sign in and view their attendance once approved.'
        : 'They will not be able to sign in until an admin approves them again.',
      confirmLabel: isApprove ? 'Approve member' : 'Decline member',
      cancelLabel: 'Cancel',
      tone: isApprove ? 'primary' : 'danger',
      action: async () => {
        await api(`/api/members/${member.id}/approval`, {
          method: 'PATCH',
          body: { approvalStatus },
        });
        setSaved(isApprove ? `${member.name} approved` : `${member.name} declined`);
        await refreshAll();
      },
    });
  }

  function requestSetActive(member, active) {
    setError('');
    setSaved('');
    confirm({
      title: active ? `Reactivate ${member.name}?` : `Deactivate ${member.name}?`,
      description: active
        ? 'They can sign in and appear on the roster again.'
        : 'They will be hidden from attendance lists until you reactivate them.',
      confirmLabel: active ? 'Reactivate' : 'Deactivate',
      cancelLabel: 'Cancel',
      tone: active ? 'primary' : 'danger',
      action: async () => {
        await api(`/api/members/${member.id}/active`, {
          method: 'PATCH',
          body: { active },
        });
        if (editingId === member.id && !active) {
          cancelEdit();
        }
        setSaved(active ? 'Member reactivated' : 'Member deactivated');
        await refreshAll();
      },
    });
  }

  function requestRemoveMember(member) {
    setError('');
    setSaved('');
    confirm({
      title: `Delete ${member.name} permanently?`,
      description:
        'This cannot be undone and removes all attendance records for this member.',
      confirmLabel: 'Delete permanently',
      cancelLabel: 'Keep member',
      tone: 'danger',
      action: async () => {
        await api(`/api/members/${member.id}`, { method: 'DELETE' });
        if (editingId === member.id) {
          cancelEdit();
        }
        setSaved('Member deleted permanently');
        await refreshAll();
      },
    });
  }

  function setActive(member, active) {
    requestSetActive(member, active);
  }

  function removeMember(member) {
    requestRemoveMember(member);
  }

  const attendanceRangeLabel = attendanceMeta.dateFiltered
    ? `from ${attendanceMeta.from || 'the beginning'} to ${attendanceMeta.to || 'today'}`
    : 'for all recorded events';

  return (
    <>
      <section className="page-head page-head-with-action">
        <div>
          <p className="eyebrow">Members</p>
          <h1>Choir members</h1>
          <p className="lede">
            Approve new sign-ups, edit roster details, and enter each member&apos;s voice range,
            choir pathway, and feedback from the <strong>Feedback</strong> screen.
          </p>
        </div>
        <button type="button" className="page-head-action" onClick={openAddMember}>
          Add member
        </button>
      </section>

      {error && !memberModalOpen ? <p className="alert">{error}</p> : null}
      <StatusMessage message={saved} onDismiss={() => setSaved('')} />

      <div className="card">
        <h2>Waiting for approval {pending.length ? `(${pending.length})` : ''}</h2>
        {pending.length === 0 ? (
          <p className="muted">No pending registrations.</p>
        ) : (
          <div className="data-list">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Voice</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {pending.map((member) => (
                  <tr key={member.id}>
                    <td>{member.name}</td>
                    <td>{member.username}</td>
                    <td>{member.email}</td>
                    <td className="capitalize">{member.voicePart}</td>
                    <td className="table-actions-cell">
                      <div className="member-row-actions member-row-actions-wrap">
                        <button
                          type="button"
                          className="table-action primary"
                          onClick={() => requestApproval(member, 'approved')}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          className="ghost danger table-action"
                          onClick={() => requestApproval(member, 'rejected')}
                        >
                          Decline
                        </button>
                        <MemberTableActions
                          member={member}
                          onFeedback={startProfile}
                          onEdit={startEdit}
                          onSetActive={setActive}
                          onDelete={removeMember}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="data-cards">
              {pending.map((member) => (
                <MemberCard
                  key={member.id}
                  member={member}
                  actions={
                    <div className="member-row-actions member-row-actions-wrap member-card-table-actions">
                      <button
                        type="button"
                        className="table-action primary"
                        onClick={() => requestApproval(member, 'approved')}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        className="ghost danger table-action"
                        onClick={() => requestApproval(member, 'rejected')}
                      >
                        Decline
                      </button>
                      <MemberTableActions
                        member={member}
                        onFeedback={startProfile}
                        onEdit={startEdit}
                        onSetActive={setActive}
                        onDelete={removeMember}
                      />
                    </div>
                  }
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="card members-card">
        <h2>Roster</h2>
        <p className="lede muted">
          Use <strong>Feedback</strong> to enter voice range, choir pathway, and notes. Click a name to
          view history. Members see their own data on <strong>My profile</strong>.
        </p>

        <FilterPanel activeCount={activeFilterCount}>
          <form className="member-filters" onSubmit={(e) => e.preventDefault()}>
          <label className="filter-field-wide">
            Search
            <input
              type="search"
              value={searchDraft}
              onChange={(e) => updateFilter('search', e.target.value)}
              placeholder="Search name, username, or email"
            />
          </label>

          <div className="filter-row">
            <label>
              Voice part
              <select value={filters.voicePart} onChange={(e) => updateFilter('voicePart', e.target.value)}>
                <option value="">All voices</option>
                {VOICE_PARTS.map((part) => (
                  <option key={part.value} value={part.value}>
                    {part.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              From
              <input
                type="date"
                value={filters.from}
                onChange={(e) => updateFilter('from', e.target.value)}
              />
            </label>
            <label>
              To
              <input type="date" value={filters.to} onChange={(e) => updateFilter('to', e.target.value)} />
            </label>
            <div className="filter-actions">
              <button type="button" className="ghost" onClick={clearFilters} disabled={!filtersActive}>
                Clear filters
              </button>
            </div>
          </div>

          <div className="filter-presets">
            <span className="filter-presets-label">Quick ranges</span>
            <div className="preset-row">
              <button
                type="button"
                className="ghost"
                onClick={() => {
                  setFilters((current) => ({
                    ...current,
                    from: toDateInput(daysAgo(30)),
                    to: toDateInput(new Date()),
                  }));
                  setPage(1);
                }}
              >
                Last 30 days
              </button>
              <button
                type="button"
                className="ghost"
                onClick={() => {
                  setFilters((current) => ({
                    ...current,
                    from: toDateInput(daysAgo(90)),
                    to: toDateInput(new Date()),
                  }));
                  setPage(1);
                }}
              >
                Last 3 months
              </button>
              <button
                type="button"
                className="ghost"
                onClick={() => {
                  setFilters((current) => ({
                    ...current,
                    from: toDateInput(yearStart()),
                    to: toDateInput(new Date()),
                  }));
                  setPage(1);
                }}
              >
                This year
              </button>
            </div>
          </div>
        </form>
        </FilterPanel>

        <p className="muted filter-summary">
          {pagination.total} of {totalUnfiltered} member{pagination.total === 1 ? '' : 's'} match
          {filtersActive ? ' these filters' : ''}. Attendance calculated {attendanceRangeLabel}.
        </p>

        {loadingRoster ? (
          <p className="muted">Loading roster…</p>
        ) : pagination.total === 0 ? (
          <p className="muted">No members match these filters.</p>
        ) : (
          <>
            <div className="data-list">
              <table className="data-table members-roster-table">
                <thead>
                  <tr>
                    <th className="col-name">Name</th>
                    <th className="col-email">Email</th>
                    <th className="col-voice">Voice</th>
                    <th className="col-range">Range</th>
                    <th className="col-pathway">Pathway</th>
                    <th className="col-attendance">Attendance</th>
                    <th className="actions-col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <tr key={member.id} className={memberModalOpen && editingId === member.id ? 'editing' : ''}>
                      <td className="col-name">
                        <Link to={`/admin/members/${member.id}/profile`} className="text-link table-cell-link">
                          {member.name}
                        </Link>
                        <span className="roster-username muted">{member.username}</span>
                      </td>
                      <td className="col-email">{member.email}</td>
                      <td className="col-voice capitalize">{member.voicePart}</td>
                      <td className="col-range">{member.voiceRange || <span className="muted">—</span>}</td>
                      <td className="col-pathway">
                        {member.choirPathway ? (
                          formatChoirPathway(member.choirPathway)
                        ) : (
                          <span className="muted">—</span>
                        )}
                      </td>
                      <td className="col-attendance">
                        <span className="roster-attendance-rate">{member.summary.rate}%</span>
                        <span className="roster-attendance-detail muted">
                          {member.summary.present} present · {member.summary.late} late · {member.summary.absent}{' '}
                          absent
                        </span>
                      </td>
                      <td className="table-actions-cell">
                        <MemberTableActions
                          member={member}
                          onFeedback={startProfile}
                          onEdit={startEdit}
                          onSetActive={setActive}
                          onDelete={removeMember}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="data-cards">
                {members.map((member) => (
                  <MemberCard
                    key={member.id}
                    member={member}
                    summary={member.summary}
                    editing={memberModalOpen && editingId === member.id}
                    actions={
                      <div className="member-card-table-actions">
                        <MemberTableActions
                          member={member}
                          onFeedback={startProfile}
                          onEdit={startEdit}
                          onSetActive={setActive}
                          onDelete={removeMember}
                        />
                      </div>
                    }
                  />
                ))}
              </div>
            </div>

            <Pagination
              page={pagination.page}
              pageSize={pagination.pageSize}
              totalItems={pagination.total}
              totalPages={pagination.totalPages}
              rangeStart={pagination.rangeStart}
              rangeEnd={pagination.rangeEnd}
              hasPrevious={pagination.hasPrevious}
              hasNext={pagination.hasNext}
              onPageChange={setPage}
              onPageSizeChange={handlePageSizeChange}
              itemLabel="members"
              disabled={loadingRoster}
            />
          </>
        )}
      </div>

      {inactive.length > 0 ? (
        <div className="card">
          <h2>Inactive ({inactive.length})</h2>
          <p className="muted">
            Deactivated members cannot sign in. Their attendance history is kept until you delete them
            permanently.
          </p>
          <div className="data-list">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {inactive.map((member) => (
                  <tr key={member.id}>
                    <td>{member.name}</td>
                    <td>{member.username}</td>
                    <td>{member.email}</td>
                    <td className="capitalize">{member.approvalStatus}</td>
                    <td className="table-actions-cell">
                      <MemberTableActions
                        member={member}
                        onFeedback={startProfile}
                        onEdit={startEdit}
                        onSetActive={setActive}
                        onDelete={removeMember}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="data-cards">
              {inactive.map((member) => (
                <MemberCard
                  key={member.id}
                  member={member}
                  statusLabel={member.approvalStatus}
                  actions={
                    <div className="member-card-table-actions">
                      <MemberTableActions
                        member={member}
                        onFeedback={startProfile}
                        onEdit={startEdit}
                        onSetActive={setActive}
                        onDelete={removeMember}
                      />
                    </div>
                  }
                />
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {declined.length > 0 ? (
        <div className="card">
          <h2>Declined</h2>
          <div className="data-list">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {declined.map((member) => (
                  <tr key={member.id}>
                    <td>{member.name}</td>
                    <td>{member.username}</td>
                    <td>{member.email}</td>
                    <td className="table-actions-cell">
                      <div className="member-row-actions member-row-actions-wrap">
                        <button
                          type="button"
                          className="table-action primary"
                          onClick={() => requestApproval(member, 'approved')}
                        >
                          Approve anyway
                        </button>
                        <MemberTableActions
                          member={member}
                          onFeedback={startProfile}
                          onEdit={startEdit}
                          onSetActive={setActive}
                          onDelete={removeMember}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="data-cards">
              {declined.map((member) => (
                <MemberCard
                  key={member.id}
                  member={member}
                  actions={
                    <div className="member-row-actions member-row-actions-wrap member-card-table-actions">
                      <button
                        type="button"
                        className="table-action primary"
                        onClick={() => requestApproval(member, 'approved')}
                      >
                        Approve anyway
                      </button>
                      <MemberTableActions
                        member={member}
                        onFeedback={startProfile}
                        onEdit={startEdit}
                        onSetActive={setActive}
                        onDelete={removeMember}
                      />
                    </div>
                  }
                />
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <MemberFormModal
        open={memberModalOpen}
        editingId={editingId}
        form={form}
        onFormChange={setForm}
        busy={busy}
        onSubmit={onSubmit}
        onClose={closeMemberModal}
        error={error}
      />

      <MemberProfileModal
        open={profileMember !== null}
        member={profileMember}
        onClose={closeProfileModal}
        onSaved={handleProfileSaved}
      />

      <ConfirmDialog {...confirmProps} />
    </>
  );
}

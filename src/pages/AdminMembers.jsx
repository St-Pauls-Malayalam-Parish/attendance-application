import { useEffect, useMemo, useState } from 'react';
import { api, VOICE_PARTS, toDateInput } from '../api.js';
import { ConfirmDialog } from '../components/ConfirmDialog.jsx';
import { Pagination } from '../components/Pagination.jsx';
import {
  emptyMemberFilters,
  memberFiltersAreActive,
  memberFiltersToParams,
} from '../utils/member-filters.js';
import { PAGE_SIZE_OPTIONS } from '../utils/pagination.js';
import { normalizeMembersLists, normalizeRosterList } from '../utils/api-data.js';

const emptyForm = {
  name: '',
  username: '',
  email: '',
  password: '',
  voicePart: 'other',
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

function MemberActions({ member, onEdit, onSetActive, onDelete }) {
  return (
    <>
      <button type="button" className="ghost" onClick={() => onEdit(member)}>
        Edit
      </button>
      {member.active ? (
        <button type="button" className="ghost danger" onClick={() => onSetActive(member, false)}>
          Deactivate
        </button>
      ) : (
        <button type="button" className="ghost" onClick={() => onSetActive(member, true)}>
          Reactivate
        </button>
      )}
      <button type="button" className="ghost danger" onClick={() => onDelete(member)}>
        Delete permanently
      </button>
    </>
  );
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
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [confirmBusy, setConfirmBusy] = useState(false);

  const filtersActive = useMemo(() => memberFiltersAreActive(filters), [filters]);

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

  function startEdit(member) {
    setError('');
    setSaved('');
    setEditingId(member.id);
    setForm({
      name: member.name,
      username: member.username,
      email: member.email,
      password: '',
      voicePart: member.voicePart || 'other',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function onSubmit(event) {
    event.preventDefault();
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
        cancelEdit();
      } else {
        await api('/api/members', { method: 'POST', body: form });
        setForm(emptyForm);
        setSaved('Member added');
      }
      await refreshAll();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function setApproval(id, approvalStatus) {
    setError('');
    setSaved('');
    try {
      await api(`/api/members/${id}/approval`, {
        method: 'PATCH',
        body: { approvalStatus },
      });
      await refreshAll();
    } catch (err) {
      setError(err.message);
    }
  }

  function requestSetActive(member, active) {
    setError('');
    setSaved('');
    setConfirmDialog({
      title: active ? `Reactivate ${member.name}?` : `Deactivate ${member.name}?`,
      description: active
        ? 'They can sign in and appear on the roster again.'
        : 'They will be hidden from attendance lists until you reactivate them.',
      confirmLabel: active ? 'Reactivate' : 'Deactivate',
      cancelLabel: 'Cancel',
      danger: !active,
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
    setConfirmDialog({
      title: `Delete ${member.name} permanently?`,
      description:
        'This cannot be undone and removes all attendance records for this member.',
      confirmLabel: 'Delete permanently',
      cancelLabel: 'Keep member',
      danger: true,
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

  async function handleConfirm() {
    if (!confirmDialog?.action) return;
    setConfirmBusy(true);
    setError('');
    try {
      await confirmDialog.action();
      setConfirmDialog(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setConfirmBusy(false);
    }
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
      <section className="page-head">
        <div>
          <p className="eyebrow">Members</p>
          <h1>Choir members</h1>
          <p className="lede">
            Approve new sign-ups, edit roster details, filter members, and review attendance rates
            for a date range.
          </p>
        </div>
      </section>

      {error ? <p className="alert">{error}</p> : null}
      {saved ? <p className="ok">{saved}</p> : null}

      <div className="card">
        <h2>Waiting for approval {pending.length ? `(${pending.length})` : ''}</h2>
        {pending.length === 0 ? (
          <p className="muted">No pending registrations.</p>
        ) : (
          <table>
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
                  <td className="row-actions">
                    <button type="button" onClick={() => setApproval(member.id, 'approved')}>
                      Approve
                    </button>
                    <button
                      type="button"
                      className="ghost danger"
                      onClick={() => setApproval(member.id, 'rejected')}
                    >
                      Decline
                    </button>
                    <MemberActions
                      member={member}
                      onEdit={startEdit}
                      onSetActive={setActive}
                      onDelete={removeMember}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <form className="card form grid-form" onSubmit={onSubmit}>
        <h2 className="span-2">{editingId ? 'Edit member' : 'Add approved member'}</h2>
        <label>
          Name
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </label>
        <label>
          Username
          <input
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase() })}
            required
          />
        </label>
        <label>
          Email
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </label>
        <label>
          {editingId ? 'Reset password (optional)' : 'Temporary password'}
          <input
            type="password"
            minLength={editingId ? undefined : 8}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required={!editingId}
            placeholder={editingId ? 'Leave blank to keep current password' : ''}
            autoComplete={editingId ? 'new-password' : 'off'}
          />
        </label>
        <label>
          Voice part
          <select value={form.voicePart} onChange={(e) => setForm({ ...form, voicePart: e.target.value })}>
            {VOICE_PARTS.map((part) => (
              <option key={part.value} value={part.value}>
                {part.label}
              </option>
            ))}
          </select>
        </label>
        <div className="row-actions span-2">
          {editingId ? (
            <button type="button" className="ghost" onClick={cancelEdit}>
              Cancel
            </button>
          ) : null}
          <button type="submit" disabled={busy}>
            {busy ? 'Saving…' : editingId ? 'Save changes' : 'Add approved member'}
          </button>
        </div>
      </form>

      <div className="card members-card">
        <h2>Roster</h2>

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
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Voice</th>
                  <th>Percentage</th>
                  <th>Present</th>
                  <th>Late</th>
                  <th>Absent</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.id} className={editingId === member.id ? 'editing' : ''}>
                    <td>{member.name}</td>
                    <td>{member.username}</td>
                    <td>{member.email}</td>
                    <td className="capitalize">{member.voicePart}</td>
                    <td>{member.summary.rate}%</td>
                    <td>{member.summary.present}</td>
                    <td>{member.summary.late}</td>
                    <td>{member.summary.absent}</td>
                    <td className="row-actions">
                      <MemberActions
                        member={member}
                        onEdit={startEdit}
                        onSetActive={setActive}
                        onDelete={removeMember}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

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
          <table>
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
                  <td className="row-actions">
                    <MemberActions
                      member={member}
                      onEdit={startEdit}
                      onSetActive={setActive}
                      onDelete={removeMember}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {declined.length > 0 ? (
        <div className="card">
          <h2>Declined</h2>
          <table>
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
                  <td className="row-actions">
                    <button type="button" className="ghost" onClick={() => setApproval(member.id, 'approved')}>
                      Approve anyway
                    </button>
                    <MemberActions
                      member={member}
                      onEdit={startEdit}
                      onSetActive={setActive}
                      onDelete={removeMember}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <ConfirmDialog
        open={confirmDialog !== null}
        onOpenChange={(open) => {
          if (!open && !confirmBusy) setConfirmDialog(null);
        }}
        title={confirmDialog?.title ?? ''}
        description={confirmDialog?.description ?? ''}
        confirmLabel={confirmDialog?.confirmLabel ?? 'Confirm'}
        cancelLabel={confirmDialog?.cancelLabel ?? 'Cancel'}
        danger={confirmDialog?.danger ?? false}
        busy={confirmBusy}
        onConfirm={handleConfirm}
      />
    </>
  );
}

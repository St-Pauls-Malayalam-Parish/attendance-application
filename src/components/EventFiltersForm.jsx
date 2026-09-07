import { useEffect, useState } from 'react';
import { api, EVENT_TYPES, LITURGICAL_COLORS, ROSTER_ATTENDANCE_FILTERS } from '../api.js';
import { normalizeRosterList } from '../utils/api-data.js';

export function EventFiltersForm({
  searchDraft,
  filters,
  years = [],
  filtersActive,
  showMemberFilters = false,
  onSearchChange,
  onFilterChange,
  onClear,
}) {
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  useEffect(() => {
    if (!showMemberFilters) {
      return undefined;
    }

    let cancelled = false;
    setLoadingMembers(true);
    api('/api/members/roster?limit=100')
      .then((data) => {
        if (!cancelled) {
          setMembers(normalizeRosterList(data, 100).members);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setMembers([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingMembers(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [showMemberFilters]);

  function handleMemberChange(value) {
    onFilterChange('memberId', value);
    if (!value) {
      onFilterChange('attendanceStatus', '');
    }
  }

  return (
    <form className="form grid-form event-filters" onSubmit={(e) => e.preventDefault()}>
      <label className="span-2">
        Search
        <input
          type="search"
          value={searchDraft}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search title or notes"
        />
      </label>

      {showMemberFilters ? (
        <>
          <label>
            Member
            <select
              value={filters.memberId}
              onChange={(e) => handleMemberChange(e.target.value)}
              disabled={loadingMembers}
            >
              <option value="">All members</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Their attendance
            <select
              value={filters.attendanceStatus}
              onChange={(e) => onFilterChange('attendanceStatus', e.target.value)}
              disabled={!filters.memberId}
            >
              <option value="">Any marked attendance</option>
              {ROSTER_ATTENDANCE_FILTERS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        </>
      ) : null}

      <label>
        Year
        <select value={filters.year} onChange={(e) => onFilterChange('year', e.target.value)}>
          <option value="">All years</option>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </label>
      <label>
        Type
        <select value={filters.type} onChange={(e) => onFilterChange('type', e.target.value)}>
          <option value="">All types</option>
          {EVENT_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        From
        <input type="date" value={filters.from} onChange={(e) => onFilterChange('from', e.target.value)} />
      </label>
      <label>
        To
        <input type="date" value={filters.to} onChange={(e) => onFilterChange('to', e.target.value)} />
      </label>
      <label>
        Liturgical colour
        <select
          value={filters.liturgicalColor}
          onChange={(e) => onFilterChange('liturgicalColor', e.target.value)}
        >
          <option value="">All colours</option>
          {LITURGICAL_COLORS.filter((color) => color.value).map((color) => (
            <option key={color.value} value={color.value}>
              {color.label}
            </option>
          ))}
        </select>
      </label>
      <div className="row-actions span-2">
        <button type="button" className="ghost" onClick={onClear} disabled={!filtersActive}>
          Clear filters
        </button>
      </div>
    </form>
  );
}

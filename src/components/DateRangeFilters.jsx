import { EVENT_TYPES, LITURGICAL_COLORS, MEMBER_ATTENDANCE_STATUSES, toDateInput } from '../api.js';

function daysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

function yearStart() {
  return new Date(new Date().getFullYear(), 0, 1);
}

export function DateRangeFilters({
  searchDraft = '',
  onSearchChange,
  showSearch = false,
  type = '',
  onTypeChange,
  liturgicalColor = '',
  onLiturgicalColorChange,
  status = '',
  onStatusChange,
  showEventFilters = false,
  from,
  to,
  filtersActive,
  onFromChange,
  onToChange,
  onClear,
  onApplyRange,
}) {
  function applyPreset(nextFrom, nextTo) {
    onApplyRange(nextFrom, nextTo);
  }

  return (
    <form className="form grid-form event-filters" onSubmit={(e) => e.preventDefault()}>
      {showSearch ? (
        <label className="span-2">
          Search
          <input
            type="search"
            value={searchDraft}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search title or notes"
          />
        </label>
      ) : null}

      {showEventFilters ? (
        <>
          <label>
            Type
            <select value={type} onChange={(e) => onTypeChange(e.target.value)}>
              <option value="">All types</option>
              {EVENT_TYPES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Liturgical color
            <select value={liturgicalColor} onChange={(e) => onLiturgicalColorChange(e.target.value)}>
              <option value="">All colors</option>
              {LITURGICAL_COLORS.filter((color) => color.value).map((color) => (
                <option key={color.value} value={color.value}>
                  {color.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Status
            <select value={status} onChange={(e) => onStatusChange(e.target.value)}>
              <option value="">All statuses</option>
              {MEMBER_ATTENDANCE_STATUSES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        </>
      ) : null}

      <label>
        From
        <input type="date" value={from} onChange={(e) => onFromChange(e.target.value)} />
      </label>
      <label>
        To
        <input type="date" value={to} onChange={(e) => onToChange(e.target.value)} />
      </label>

      <div className="filter-presets span-2">
        <span className="filter-presets-label">Quick ranges</span>
        <div className="preset-row">
          <button
            type="button"
            className="ghost"
            onClick={() => applyPreset(toDateInput(daysAgo(30)), toDateInput(new Date()))}
          >
            Last 30 days
          </button>
          <button
            type="button"
            className="ghost"
            onClick={() => applyPreset(toDateInput(daysAgo(90)), toDateInput(new Date()))}
          >
            Last 3 months
          </button>
          <button
            type="button"
            className="ghost"
            onClick={() => applyPreset(toDateInput(yearStart()), toDateInput(new Date()))}
          >
            This year
          </button>
        </div>
      </div>

      <div className="row-actions span-2">
        <button type="button" className="ghost" onClick={onClear} disabled={!filtersActive}>
          Clear filters
        </button>
      </div>
    </form>
  );
}

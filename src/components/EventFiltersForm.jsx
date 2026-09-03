import { EVENT_TYPES, LITURGICAL_COLORS } from '../api.js';

export function EventFiltersForm({
  searchDraft,
  filters,
  years,
  filtersActive,
  onSearchChange,
  onFilterChange,
  onClear,
}) {
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

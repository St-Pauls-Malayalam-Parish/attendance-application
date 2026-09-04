import { VOICE_PARTS } from '../api.js';

export function RosterFiltersForm({
  searchDraft,
  voicePart,
  filtersActive,
  onSearchChange,
  onVoicePartChange,
  onClear,
}) {
  return (
    <form className="member-filters roster-filters" onSubmit={(e) => e.preventDefault()}>
      <label className="filter-field-wide">
        Search
        <input
          type="search"
          value={searchDraft}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search name or email"
        />
      </label>

      <div className="filter-row">
        <label>
          Voice part
          <select value={voicePart} onChange={(e) => onVoicePartChange(e.target.value)}>
            <option value="">All voices</option>
            {VOICE_PARTS.map((part) => (
              <option key={part.value} value={part.value}>
                {part.label}
              </option>
            ))}
          </select>
        </label>
        <div className="filter-actions">
          <button type="button" className="ghost" onClick={onClear} disabled={!filtersActive}>
            Clear filters
          </button>
        </div>
      </div>
    </form>
  );
}

import { useState } from 'react';
import { useIsMobile } from '../hooks/useMediaQuery.js';

export function FilterPanel({ activeCount = 0, children }) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const expanded = !isMobile || open;

  return (
    <div className="filter-panel">
      <button
        type="button"
        className="filter-panel-toggle ghost"
        aria-expanded={expanded}
        onClick={() => setOpen((current) => !current)}
      >
        Filters
        {activeCount > 0 ? <span className="filter-panel-badge">{activeCount}</span> : null}
      </button>
      <div className={`filter-panel-body${expanded ? ' is-open' : ''}`}>{children}</div>
    </div>
  );
}

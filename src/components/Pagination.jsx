import { PAGE_SIZE_OPTIONS } from '../utils/pagination.js';

export function Pagination({
  page,
  pageSize,
  totalItems,
  totalPages,
  rangeStart,
  rangeEnd,
  hasPrevious,
  hasNext,
  onPageChange,
  onPageSizeChange,
  showPageSize = true,
  itemLabel = '',
  disabled = false,
}) {
  if (totalItems === 0) {
    return null;
  }

  const rangeText = itemLabel
    ? `${rangeStart}–${rangeEnd} of ${totalItems} ${itemLabel}`
    : `${rangeStart}–${rangeEnd} of ${totalItems}`;

  return (
    <nav className="pagination" aria-label="Pagination">
      <div className="pagination-meta">
        <p className="pagination-range muted">{rangeText}</p>
        {showPageSize ? (
          <label className="pagination-size">
            <span>Per page</span>
            <select
              value={pageSize}
              disabled={disabled}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              aria-label="Results per page"
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>

      <div className="pagination-nav">
        <button
          type="button"
          className="ghost pagination-btn"
          disabled={disabled || !hasPrevious}
          onClick={() => onPageChange(page - 1)}
        >
          <span className="pagination-btn-short" aria-hidden="true">Prev</span>
          <span className="pagination-btn-full">Previous</span>
        </button>
        <span className="pagination-status">
          Page {page} of {totalPages}
        </span>
        <button
          type="button"
          className="ghost pagination-btn"
          disabled={disabled || !hasNext}
          onClick={() => onPageChange(page + 1)}
        >
          <span className="pagination-btn-short" aria-hidden="true">Next</span>
          <span className="pagination-btn-full">Next</span>
        </button>
      </div>
    </nav>
  );
}

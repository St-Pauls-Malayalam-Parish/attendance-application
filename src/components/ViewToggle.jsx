export function ViewToggle({ value, onChange, options, label = 'View mode' }) {
  return (
    <div className="view-toggle" role="tablist" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={value === option.value}
          className={value === option.value ? 'active' : ''}
          onClick={() => onChange(option.value)}
        >
          {option.label}
          {option.badge ? <span className="view-toggle-badge">{option.badge}</span> : null}
        </button>
      ))}
    </div>
  );
}

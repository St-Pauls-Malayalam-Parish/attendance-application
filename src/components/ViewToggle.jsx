export function ViewToggle({ value, onChange, options }) {
  return (
    <div className="view-toggle" role="tablist" aria-label="View mode">
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
        </button>
      ))}
    </div>
  );
}

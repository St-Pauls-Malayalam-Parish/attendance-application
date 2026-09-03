const LABELS = {
  white: 'White',
  green: 'Green',
  purple: 'Purple',
  red: 'Red',
  black: 'Black',
};

const VALID_COLORS = new Set(['white', 'green', 'purple', 'red', 'black']);

export function liturgicalColorLabel(value) {
  if (!value) return '—';
  return LABELS[value] || value;
}

export function LiturgicalColorBadge({ color }) {
  if (!color || !VALID_COLORS.has(color)) {
    return <span className="muted">—</span>;
  }

  return (
    <span className="liturgical-color">
      <span className={`liturgical-swatch liturgical-${color}`} aria-hidden="true" />
      {liturgicalColorLabel(color)}
    </span>
  );
}

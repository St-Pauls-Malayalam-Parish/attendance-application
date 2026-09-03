export const emptyEventFilters = () => ({
  search: '',
  year: '',
  from: '',
  to: '',
  type: '',
  liturgicalColor: '',
});

export function eventFiltersToParams(filters, { page, pageSize }) {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('limit', String(pageSize));

  const search = filters.search.trim();
  if (search) params.set('search', search);
  if (filters.year) params.set('year', filters.year);
  if (filters.from) params.set('from', filters.from);
  if (filters.to) params.set('to', filters.to);
  if (filters.type) params.set('type', filters.type);
  if (filters.liturgicalColor) params.set('liturgicalColor', filters.liturgicalColor);

  return params;
}

export function filtersAreActive(filters) {
  return Object.values(filters).some((value) => Boolean(value));
}

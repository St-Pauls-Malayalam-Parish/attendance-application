export const emptyMemberFilters = () => ({
  search: '',
  voicePart: '',
  from: '',
  to: '',
});

export function memberFiltersToParams(filters, { page, pageSize }) {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('limit', String(pageSize));

  const search = filters.search.trim();
  if (search) params.set('search', search);
  if (filters.voicePart) params.set('voicePart', filters.voicePart);
  if (filters.from) params.set('from', filters.from);
  if (filters.to) params.set('to', filters.to);

  return params;
}

export function memberFiltersAreActive(filters) {
  return Object.values(filters).some((value) => Boolean(value));
}

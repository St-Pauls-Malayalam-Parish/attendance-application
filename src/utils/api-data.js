export function asArray(value) {
  return Array.isArray(value) ? value : [];
}

export function emptyPagination(pageSize = 10) {
  return {
    page: 1,
    pageSize,
    total: 0,
    totalPages: 1,
    rangeStart: 0,
    rangeEnd: 0,
    hasPrevious: false,
    hasNext: false,
  };
}

export function normalizePagination(value, pageSize = 10) {
  const fallback = emptyPagination(pageSize);
  if (!value || typeof value !== 'object') {
    return fallback;
  }
  return { ...fallback, ...value };
}

export function metaTotalUnfiltered(data) {
  return data?.meta?.totalUnfiltered ?? 0;
}

export function normalizeEventsList(data, pageSize = 10) {
  return {
    events: asArray(data?.events),
    pagination: normalizePagination(data?.pagination, pageSize),
    totalUnfiltered: metaTotalUnfiltered(data),
  };
}

export function normalizeAttendanceMe(data) {
  return {
    ...data,
    history: asArray(data?.history),
    summary: {
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
      total: 0,
      rate: 0,
      ...data?.summary,
    },
    pagination: normalizePagination(data?.pagination),
    meta: { totalUnfiltered: 0, ...data?.meta },
  };
}

export function normalizeMembersLists(data) {
  return {
    pending: asArray(data?.pending),
    inactive: asArray(data?.inactive),
    declined: asArray(data?.declined),
  };
}

export function normalizeRosterList(data, pageSize = 10) {
  return {
    members: asArray(data?.members),
    pagination: normalizePagination(data?.pagination, pageSize),
    totalUnfiltered: metaTotalUnfiltered(data),
    attendanceMeta: {
      dateFiltered: Boolean(data?.meta?.dateFiltered),
      from: data?.meta?.from || '',
      to: data?.meta?.to || '',
    },
  };
}

export function normalizeAttendanceEvent(data) {
  return {
    event: data?.event ?? null,
    roster: asArray(data?.roster),
  };
}

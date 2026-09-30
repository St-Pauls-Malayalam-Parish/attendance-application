import { describe, expect, it } from 'vitest';
import {
  emptyEventFilters,
  eventFiltersToParams,
  filtersAreActive,
} from '../src/utils/event-filters.js';
import {
  emptyMemberFilters,
  memberFiltersAreActive,
  memberFiltersToParams,
} from '../src/utils/member-filters.js';

describe('member-filters', () => {
  it('builds roster query params', () => {
    const params = memberFiltersToParams(
      {
        search: '  anil  ',
        voicePart: 'tenor',
        from: '2026-01-01',
        to: '2026-01-31',
        attendanceStatus: 'late',
      },
      { page: 2, pageSize: 25 }
    );

    expect(params.get('search')).toBe('anil');
    expect(params.get('voicePart')).toBe('tenor');
    expect(params.get('from')).toBe('2026-01-01');
    expect(params.get('to')).toBe('2026-01-31');
    expect(params.get('attendanceStatus')).toBe('late');
    expect(params.get('page')).toBe('2');
    expect(params.get('limit')).toBe('25');
  });

  it('sends an event id and skips the date range', () => {
    const params = memberFiltersToParams(
      {
        ...emptyMemberFilters(),
        eventId: 'event-1',
        from: '2026-01-01',
        to: '2026-01-31',
        attendanceStatus: 'present',
      },
      { page: 1, pageSize: 10 }
    );

    expect(params.get('eventId')).toBe('event-1');
    expect(params.get('attendanceStatus')).toBe('present');
    expect(params.get('from')).toBeNull();
    expect(params.get('to')).toBeNull();
  });

  it('detects active member filters', () => {
    expect(memberFiltersAreActive(emptyMemberFilters())).toBe(false);
    expect(memberFiltersAreActive({ ...emptyMemberFilters(), attendanceStatus: 'present' })).toBe(
      true
    );
  });
});

describe('event-filters', () => {
  it('builds event query params including member attendance filters', () => {
    const params = eventFiltersToParams(
      {
        ...emptyEventFilters(),
        search: 'practice',
        memberId: 'member-1',
        attendanceStatus: 'present',
        type: 'practice',
      },
      { page: 1, pageSize: 10 }
    );

    expect(params.get('search')).toBe('practice');
    expect(params.get('memberId')).toBe('member-1');
    expect(params.get('attendanceStatus')).toBe('present');
    expect(params.get('type')).toBe('practice');
  });

  it('detects active event filters', () => {
    expect(filtersAreActive(emptyEventFilters())).toBe(false);
    expect(filtersAreActive({ ...emptyEventFilters(), memberId: 'member-1' })).toBe(true);
  });
});

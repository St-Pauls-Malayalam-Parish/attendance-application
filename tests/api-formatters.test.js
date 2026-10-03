import { describe, expect, it } from 'vitest';
import {
  formatAttendanceRate,
  formatMemberAttendanceDetail,
  hasCountableAttendance,
} from '../src/api.js';

describe('attendance formatters', () => {
  describe('hasCountableAttendance', () => {
    it('uses counted when provided', () => {
      expect(hasCountableAttendance({ counted: 2 })).toBe(true);
      expect(hasCountableAttendance({ counted: 0 })).toBe(false);
    });

    it('falls back to present, late, and absent totals', () => {
      expect(hasCountableAttendance({ present: 1, late: 0, absent: 0 })).toBe(true);
      expect(hasCountableAttendance({ present: 0, late: 1, absent: 0 })).toBe(true);
      expect(hasCountableAttendance({ present: 0, late: 0, absent: 1 })).toBe(true);
      expect(hasCountableAttendance({ excused: 3 })).toBe(false);
    });
  });

  describe('formatAttendanceRate', () => {
    it('shows zero percent when there is no attendance yet', () => {
      expect(formatAttendanceRate({})).toBe('0%');
      expect(formatAttendanceRate({ present: 0, absent: 0, rate: 0, counted: 0 })).toBe('0%');
    });

    it('shows em dash when only excused absences count toward history', () => {
      expect(formatAttendanceRate({ excused: 1, rate: 0, total: 1 })).toBe('—');
    });

    it('shows percentage when countable attendance exists', () => {
      expect(formatAttendanceRate({ present: 2, absent: 0, rate: 100 })).toBe('100%');
      expect(formatAttendanceRate({ present: 1, absent: 1, rate: 50, counted: 2 })).toBe('50%');
    });
  });

  describe('formatMemberAttendanceDetail', () => {
    it('summarizes present attendance with late breakdown', () => {
      expect(formatMemberAttendanceDetail({ present: 1, late: 1, absent: 0 })).toBe(
        '2 present (1 late)'
      );
      expect(formatMemberAttendanceDetail({ present: 2, late: 0, absent: 0 })).toBe('2 present');
    });

    it('includes absent and excused counts when present', () => {
      expect(formatMemberAttendanceDetail({ present: 1, late: 0, absent: 1, excused: 2 })).toBe(
        '1 present · 1 absent · 2 excused'
      );
    });

    it('shows excused-only and empty states', () => {
      expect(formatMemberAttendanceDetail({ excused: 1 })).toBe('1 excused');
      expect(formatMemberAttendanceDetail({})).toBe('No records yet');
    });
  });
});

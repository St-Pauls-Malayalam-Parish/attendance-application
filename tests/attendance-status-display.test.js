import { describe, expect, it } from 'vitest';
import { isLateAttendanceRow } from '../src/components/AttendanceStatusDisplay.jsx';

describe('AttendanceStatusDisplay helpers', () => {
  it('detects late rows from display status or late flag', () => {
    expect(isLateAttendanceRow({ status: 'late', late: false })).toBe(true);
    expect(isLateAttendanceRow({ status: 'present', late: true })).toBe(true);
    expect(isLateAttendanceRow({ status: 'present', late: false })).toBe(false);
    expect(isLateAttendanceRow({ status: 'absent', late: false })).toBe(false);
  });
});
